import { getCurrentWindow } from "@tauri-apps/api/window"
import { check } from "@tauri-apps/plugin-updater"
import type { TauriApp } from "./App"

const tauriWindow = getCurrentWindow()

export const appWindow: TauriApp = {
	platform: "tauri",

	minimize: () => tauriWindow.minimize(),
	toggleMaximize: () => tauriWindow.toggleMaximize(),
	close: () => tauriWindow.close(),

	update: {
		check
	}
}