import { log, message, globalConfig } from '/src/API.js';
import MyComponent from '/src/components/CustomDropdown.vue';

export default function initPlugin(api) {
    log.normal('MyPlugin initialized!');
    // Use api, register components, etc.
}