import { ref } from "vue";
import { WindowModel } from "./WindowModel";

class WindowManager {
	private nextId = 1;
	private topZIndex = 10;

	public windows = ref<WindowModel[]>([]);

	createWindow(title: string, width: number, height: number) {
		const window = new WindowModel({
			id: this.nextId++,
			title,
			width,
			height,
			zIndex: this.topZIndex++,
		});

		this.windows.value.push(window);
		return window;
	}

	removeWindow(id: number) {
		this.windows.value = this.windows.value.filter((w) => w.id !== id);
	}

	bringToFront(window: WindowModel) {
		window.zIndex = this.topZIndex++;
	}
}

export const windowManager = new WindowManager();
