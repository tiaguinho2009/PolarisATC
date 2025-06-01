// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use std::fs;
use std::env;

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
    println!("Tentando ler: {:?}", path);
    let base = std::env::current_exe()
        .map_err(|_| "Failed to get current exe path".to_string())?
        .parent()
        .ok_or("No parent directory for exe".to_string())?
        .join("resources")
        .join("SectorFiles");
    let full_path = base.join(&path);
    println!("Caminho completo: {:?}", full_path);
    let content = std::fs::read_to_string(&full_path).map_err(|e| e.to_string())?;
    Ok(content)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_sector_files, read_sector_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}