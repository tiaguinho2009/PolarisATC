import { createApp } from "vue";
import { createPinia } from "pinia";
import { EventSystem, Logger } from "tico-basics";

import type { Events } from "./types/events";

import "./style.css";
import App from "./App.vue";

import WindowManager from "./utils/WindowManager";

export const log = new Logger("PolarisATC");
export const events = new EventSystem<Events>({
    debug: true,
}, log);

export const windowManager = new WindowManager();

log.info("Starting application");
log.time("Application startup");

const app = createApp(App);
app.use(createPinia());
app.mount("#app");

log.success("Application started");
log.timeEnd("Application startup");