import { EventEmitter } from 'events'

export default class EventWrapper {
  private events: { [name: string]: () => void } = {}
  private emitter: EventEmitter

  /**
   * EventWrapper's constructor
   * @param {EventEmitter} emitter
   */
  constructor(emitter: EventEmitter) {
    this.emitter = emitter
  }

  /**
   * Listen to an event
   * @param {string} eventName Name of the event to listen
   * @param {function} eventListener Callback
   * @returns {EventWrapper}
   */
  on(eventName: string, eventListener: () => void): this
  {
    this.events[eventName] = eventListener
    this.emitter.on(eventName, eventListener)
    return this
  }

  /**
   * Listen to an event one time only
   * @param {String} eventName Name of the event to listen
   */
  once<T>(eventName: string): Promise<T>
  {
    return new Promise((resolve, reject) => {
      const callback = packet => {
        delete this.events[eventName]
        resolve(packet)
      }
      this.emitter.once(eventName, callback)
    })
  }

  /**
   * Unregister all events
   * @returns {EventWrapper}
   */
  unregisterAll(): this
  {
    for (const eventName in this.events) {
      const eventListener = this.events[eventName]
      this.emitter.off(eventName, eventListener)
      delete this.events[eventName]
    }
    return this
  }
}
