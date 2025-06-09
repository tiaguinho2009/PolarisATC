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
        log.log('Sector changed to:', sector)
        radarEvents.emit('sectorChanged', sector)
    }
}

// ===================== Logging =====================
export const log = {
    warn: (msg, ...args) => {
        console.warn('[PolarisATC] [WARN]', msg, ...args)
        uiEvents.emit('warn', ['[WARN]', msg, ...args])
    },
    error: (msg, ...args) => {
        console.error('[PolarisATC] [ERROR]', msg, ...args)
        uiEvents.emit('error', ['[ERROR]', msg, ...args])
    },
    log: (msg, ...args) => {
        console.log('[PolarisATC]', msg, ...args)
        uiEvents.emit('log', [msg, ...args])
    }
}

// ===================== Messaging =====================
export function message(title, body, options = {}) {
    uiEvents.emit('message', {
        title,
        body,
        options
    })
}

// Basic utility functions
export let sector = null;

export const sectorFileAPI = {
    async load(basePath = globalConfig.sector?.basePath, file = globalConfig.sector?.mainFile) {
        if (!basePath || !file) {
            log.warn('getSectorFileData called without basePath or file')
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
                                        const loaded = await sectorFileAPI.load(basePath, nextPath);
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
            log.error('Failed to load sector file:', basePath, file, e)
            return null;
        }
    },
    
    async loadSector(basePath, file) {
        const loaded = await sectorFileAPI.load(basePath, file);
        sector = loaded;
        return loaded;
    }
}

// ===================== API Export =====================
// Compose the API object for plugins and global access
const API = {
    radarEvents,
    uiEvents,
    globalConfig,
    log,
    message,
    sectorFileAPI,
    sector
}

export default API

// Notes:
// - All API objects are grouped by concern (events, config, plugins, etc).
// - Plugins receive the full API object on registration for maximum flexibility.
// - For Vue reactivity, consider using Vue's reactive() for globalConfig if needed.