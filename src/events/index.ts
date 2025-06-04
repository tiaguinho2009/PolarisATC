import { EventEmitter } from './EventEmitter'
import type { RadarEventMap } from './RadarEvents'
import type { UIEventMap } from './UIEvents'

export const radarEvents = new EventEmitter<RadarEventMap>()
export const uiEvents = new EventEmitter<UIEventMap>()

export { EventEmitter }
export type { RadarEventMap, UIEventMap }