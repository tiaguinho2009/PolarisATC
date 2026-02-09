import type { UIColorScheme } from "../types/UIColorScheme";

export function applySchemeToCSS(scheme: UIColorScheme) {
	const root = document.documentElement;

	Object.entries(scheme).forEach(([key, value]) => {
		root.style.setProperty(`--ui-${key}`, value);
	});
}
