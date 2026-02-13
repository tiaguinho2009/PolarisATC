import type { WebApp } from "./App"

export const appWindow: WebApp = {
	platform: "web",

	minimize: () => console.warn("Minimize not available"),
	toggleMaximize: () => console.warn("Maximize not available"),
	close: () => console.warn("Close not available"),

	update: null
}
