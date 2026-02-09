import { defineStore } from "pinia";
import { applySchemeToCSS } from "../utils/applySchemeToCSS";
import type { UIColorScheme } from "../types/UIColorScheme";

const defaultUIScheme: UIColorScheme = {
	background: "#0b0f14",

	primary: "#0064aa",
	secondary: "#0078bd",

	textPrimary: "#ffffff",
	textSecondary: "#aaaaaa",

	panelBackground: "#001c2f",
	panelBorder: "#0064aa",

	warning: "#ffaa00",
	danger: "#ff4444",
	success: "#44ff44",
};

export const useColorSchemeStore = defineStore("colorscheme", {
	state: () => ({
		scheme: defaultUIScheme as UIColorScheme,
	}),

	actions: {
		setScheme(newScheme: UIColorScheme) {
			this.scheme = newScheme;
			this.update();
		},
		update() {
			applySchemeToCSS(this.scheme);
		},
	},
});
