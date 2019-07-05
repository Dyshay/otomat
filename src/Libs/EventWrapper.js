module.exports = class EventWrapper {
	/**
	 * EventWrapper's constructor
	 * @param {import('events').EventEmitter} emitter 
	 */
	constructor(emitter) {
		this.emitter = emitter
		this.events = {}
	}

	/**
	 * Listen to an event
	 * @param {string} eventName Name of the event to listen
	 * @param {function} eventListener Callback
	 * @returns {EventWrapper}
	 */
	on(eventName, eventListener) {
		this.events[eventName] = eventListener
		this.emitter.on(eventName, eventListener)
		return this
	}

	/**
	 * Unregister all events
	 * @returns {EventWrapper}
	 */
	unregisterAll() {
		for (const event of this.events) {
			this.emitter.off(eventName, eventListener)
			delete this.events[event]
		}
		return this
	}
}