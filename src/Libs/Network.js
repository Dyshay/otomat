const { EventEmitter } = require('events')
const EventWrapper = require('./EventWrapper')
const { ucFirst } = require('./Helper')

class Network {
	constructor(primus) {
		this.Primus = primus
		this.Client = null
	}

	/**
	 * Make and maintain connection to `serverAddress`
	 * @param {string} serverAddress Game server endpoint
	 * @returns {Network}
	 */
	connect(serverAddress) {
		if (this.Client !== null) {
			throw new Error('A connection has already in progress.')
		}
		console.log('Connecting to ' + serverAddress)
		const { Primus } = this
        this.Client = new Primus(serverAddress, {
            manual: true,
            reconnect: {
                max: 5000,
                min: 500,
                retries: 0
            },
            strategy: 'disconnect, timeout'
        })
		
        this.Client
			.on('open', () => {
				console.log('<Network> Connection opened.')
				this.Dispatcher.emit('SocketConnected')
			})
			.on('data', packet => {
				console.log('<Network> Data received (' + packet._messageType + ')')
				this.Dispatcher.emit(ucFirst(packet._messageType), packet)
			})
			.on('reconnect', () => {
				console.log('<Network> Trying to reconnect')
				this.Dispatcher.emit('SocketReconnecting')
			})
			.on('error', e => {
                console.log('<Network> An error occured')
				console.log(e)
				this.Dispatcher.emit('SocketError')
            })
			.on('close', () => {
				console.log('<Network> Connection closed')
				this.Dispatcher.emit('SocketClosed')
			})
			.on('end', () => {
				console.log('<Network> Connection ended')
				this.Dispatcher.emit('SocketEnded')
            })

        this.Client.open()
		return this
	}

	/**
	 * Log out from the game server
	 * @param {string} reason Reason to log-out the user
	 * @returns {Network}
	 */
	disconnect(reason) {
		this.send('disconnecting', reason)
		this.Client.destroy()
		this.Client = null
		return this
	}

	/**
	 * Send something to the server
	 * @param {string} call Name of the packet to send
	 * @param {object} data JSON data to send
	 * @returns {Network}
	 */
	send(call, data) {
		if (!this.Client) {
			throw new Error('Trying to send data to an unavailable connection.')
		}

		this.Client.write({ call, data })
		return this
	}

	/**
	 * Send a packet to the server
	 * @param {string} type Name of the packet to send
	 * @param {object} data JSON data to send
	 * @returns {Network}
	 */
	sendMessage(type, data) {
		return this.send('sendMessage', { type, data })
	}

	/**
	 * Wrap socket events
	 * @returns {EventWrapper}
	 */
	createWrapper() {
		return new EventWrapper(this.Dispatcher)
	}

	/**
	 * Mounting
	 * @returns {Network}
	 */
	mount() {
		this.Dispatcher = new EventEmitter()
		return this
	}

	/**
	 * Unmouting
	 * @returns {Network}
	 * @todo Investigate for an existing reason that we can use
	 */
	unmount() {
		if (this.Client !== null) {
			this.disconnect('NO_REASON')
		}

		this.Dispatcher = null
		return this
	}
}

module.exports = Network