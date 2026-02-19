import type { WebApp } from "./App"
const log = console

export const appWindow: WebApp = {
	platform: "web",

	minimize: () => log.warn("Minimize not available"),
	toggleMaximize: () => log.warn("Maximize not available"),
	close: () => log.warn("Close not available"),

	update: null
}
