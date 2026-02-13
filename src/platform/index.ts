import type { App } from "./App"

let appWindow: App

try {
  appWindow = (await import("./tauri")).appWindow
} catch {
  appWindow = (await import("./web")).appWindow
}

export { appWindow }
