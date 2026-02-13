import type { Update } from "@tauri-apps/plugin-updater"

export interface BaseApp {
	minimize(): void
	toggleMaximize(): void
	close(): void
}

export interface TauriApp extends BaseApp {
	platform: "tauri"
	update: {
		check(): Promise<Update | null>
	}
}

export interface WebApp extends BaseApp {
	platform: "web"
	update: null
}

export type App = TauriApp | WebApp
