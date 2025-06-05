import { invoke } from '@tauri-apps/api/core'
import { radarEvents, uiEvents } from './events'

// ===================== Global Config =====================
// You can make this reactive with Vue's reactive() if needed
export const globalConfig = {
    theme: 'default',
    sector: null,
    setTheme(theme) {
        this.theme = theme
        uiEvents.emit('themeChanged', theme)
    },
    setSector(sector) {
        this.sector = sector
        console.log('Sector changed to:', sector)
        radarEvents.emit('sectorChanged', sector)
    }
}

// ===================== Plugin System =====================
const plugins = []
export function registerPlugin(plugin) {
    // Plugins receive API context on init
    if (typeof plugin.init === 'function') plugin.init(API)
    plugins.push(plugin)
    uiEvents.emit('pluginRegistered', plugin)
}
export function getPlugins() {
    return plugins
}

// ===================== Logging =====================
export function log(msg, ...args) {
    // You can replace this with a more advanced logger
    console.log('[PolarisATC]', msg, ...args)
    uiEvents.emit('log', [msg, ...args])
}

// ===================== Hooks (for extensibility) =====================
export function addRadarHook(event, fn) {
    radarEvents.on(event, fn)
}
export function removeRadarHook(event, fn) {
    radarEvents.off(event, fn)
}
export function addUIHook(event, fn) {
    uiEvents.on(event, fn)
}
export function removeUIHook(event, fn) {
    uiEvents.off(event, fn)
}

// Basic utility functions
export async function getSectorFileData(basePath = globalConfig.sector?.basePath, file = globalConfig.sector?.mainFile) {
    if (!basePath || !file) {
        console.warn('getSectorFileData called without basePath or file');
        return null;
    }
    let relPath = `${basePath}${file}`.replace(/\\/g, '/').replace(/^\/+/, '');
    try {
        const res = await invoke('read_sector_file', { path: relPath });
        if (!res) return null;
        try {
            const data = JSON.parse(res);
            async function resolveRefs(obj, currentPath) {
                if (Array.isArray(obj)) {
                    return Promise.all(obj.map(item => resolveRefs(item, currentPath)));
                } else if (obj && typeof obj === 'object') {
                    const entries = await Promise.all(
                        Object.entries(obj).map(async ([key, value]) => {
                            if (typeof value === 'string' && value.endsWith('.json')) {
                                const nextPath = value.startsWith('data/') ? value : `${currentPath}${value}`;
                                try {
                                    const loaded = await getSectorFileData(basePath, nextPath);
                                    return [key, loaded];
                                } catch {
                                    return [key, null];
                                }
                            } else {
                                return [key, await resolveRefs(value, currentPath)];
                            }
                        })
                    );
                    return Object.fromEntries(entries);
                } else {
                    return obj;
                }
            }
            return resolveRefs(data, basePath);
        } catch {
            return null;
        }
    } catch (e) {
        console.error('Failed to load sector file:', e);
        return null;
    }
}

// ===================== API Export =====================
// Compose the API object for plugins and global access
const API = {
    radarEvents,
    uiEvents,
    globalConfig,
    registerPlugin,
    getPlugins,
    log,
    addRadarHook,
    removeRadarHook,
    addUIHook,
    removeUIHook,
    getSectorFileData
}

export default API

// Notes:
// - All API objects are grouped by concern (events, config, plugins, etc).
// - Plugins receive the full API object on registration for maximum flexibility.
// - For Vue reactivity, consider using Vue's reactive() for globalConfig if needed.