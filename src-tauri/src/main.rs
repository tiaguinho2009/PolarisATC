// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use tauri::{command, State};
use tauri_plugin_updater::UpdaterExt;

struct NodeServer {
    child: Arc<Mutex<Child>>,
}

#[command]
fn list_sector_files(subdir: Option<String>) -> Result<Vec<String>, String> {
    let mut path = env::current_exe()
        .map_err(|_| "Failed to get current exe path".to_string())?
        .parent()
        .ok_or("No parent directory for exe".to_string())?
        .join("resources")
        .join("SectorFiles");
    if let Some(sub) = subdir {
        path = path.join(sub);
    }
    let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut files = vec![];
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        files.push(name);
    }
    Ok(files)
}

#[command]
fn read_sector_file(path: String) -> Result<String, String> {
    let base = std::env::current_exe()
        .map_err(|_| "Failed to get current exe path".to_string())?
        .parent()
        .ok_or("No parent directory for exe".to_string())?
        .join("resources")
        .join("SectorFiles");
    let full_path = base.join(&path);
    let content = std::fs::read_to_string(&full_path).map_err(|e| e.to_string())?;
    Ok(content)
}

#[command]
fn send_to_node(data: String, state: State<NodeServer>) -> Result<String, String> {
    let mut child = state.child.lock().unwrap();

    // Envia para o Node.js
    if let Some(stdin) = &mut child.stdin {
        stdin
            .write_all(format!("{}\n", data).as_bytes())
            .map_err(|e| e.to_string())?;
        stdin.flush().map_err(|e| e.to_string())?;
    }

    // Lê a resposta do Node.js (uma linha)
    if let Some(stdout) = &mut child.stdout {
        let mut reader = BufReader::new(stdout);
        let mut response = String::new();
        reader.read_line(&mut response).map_err(|e| e.to_string())?;
        Ok(response.trim().to_string())
    } else {
        Err("No stdout from Node.js".to_string())
    }
}

fn main() {
    // Inicia o Node.js server
    let child = Command::new("node")
        .arg("server.js")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to start Node.js server");

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Checa e instala update automaticamente
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Ok(Some(update)) = handle.updater().unwrap().check().await {
                    let mut downloaded = 0;
                    update
                        .download_and_install(
                            |chunk_length, content_length| {
                                downloaded += chunk_length;
                                println!("downloaded {downloaded} from {content_length:?}");
                            },
                            || {
                                println!("download finished");
                            },
                        )
                        .await
                        .unwrap();
                    println!("update installed");
                    handle.restart();
                }
            });
            Ok(())
        })
        .manage(NodeServer {
            child: Arc::new(Mutex::new(child)),
        })
        .invoke_handler(tauri::generate_handler![
            send_to_node,
            list_sector_files,
            read_sector_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}