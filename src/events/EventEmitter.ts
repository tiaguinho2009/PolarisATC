type Listener<T> = (payload: T) => void

export class EventEmitter<TEventMap extends Record<string, any>> {
  private events: { [K in keyof TEventMap]?: Listener<TEventMap[K]>[] } = {}

  on<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>) {
    if (!this.events[event]) this.events[event] = []
    this.events[event]!.push(listener)
  }

  off<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>) {
    if (!this.events[event]) return
    this.events[event] = this.events[event]!.filter(l => l !== listener)
  }

  emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]) {
    if (!this.events[event]) return
    for (const listener of this.events[event]!) listener(payload)
  }
}