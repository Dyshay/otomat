const { EventEmitter } = require('events')
const EventWrapper = require('./event-wrapper')
const { ucFirst } = require('./helper')
const { Servers } = require('../configurations/constants')

module.exports = class Socket {
	constructor(primus) {
		this.primus = primus
		this.client = null
		this.dispatcher = null
		this._serverType = Socket.ServerTypeEnum.NONE
	}

	static get ServerTypeEnum() {
		return {
			NONE: null,
			LOGIN: 'Login',
			GAME: 'Game'
		}
	}

	get serverType() {
		return this._serverType
	}

	/**
	 * Make and maintain connection to the `serverType` corresponding server address
	 * @param {string} phase Phase
	 * @returns {Network}
	 */
	connect(serverType, sticker) {
		if (![ Socket.ServerTypeEnum.LOGIN, Socket.ServerTypeEnum.GAME ].includes(serverType)) {
			throw new Error('Unable to found the corresponding server.')
		}

		if (this.client !== null) {
			throw new Error('A connection has already in progress.')
		}
		
		const serverAddress = (serverType === Socket.ServerTypeEnum.LOGIN ? Servers.Auth : Servers.Game) + '?STICKER=' + sticker
		this._serverType = serverType
		console.log(`Connecting to \`${serverType}\` server`)

        this.client = new this.primus(serverAddress, {
            manual: true,
            reconnect: {
                max: 5000,
                min: 500,
                retries: 0
            },
            strategy: 'disconnect, timeout'
        })
		
        this.client
			.on('open', this._OnSocketOpened.bind(this))
			.on('data', this._OnSocketDataReceived.bind(this))
			.on('reconnect', this._OnSocketReconnecting.bind(this))
			.on('error', this._OnSocketError.bind(this))
			.on('close', this._OnSocketClosed.bind(this))
			.on('end', this._OnSocketEnded.bind(this))
			.open()

		return this
	}

	_OnSocketOpened() {
		console.log('<Socket> Connection opened.')
		this.dispatcher.emit('SocketConnected')
	}

	_OnSocketDataReceived(packet) {
		console.log('<Socket> Data received (' + packet._messageType + ')')
		this.dispatcher.emit(ucFirst(packet._messageType), packet)
	}

	_OnSocketReconnecting() {
		console.log('<Socket> Trying to reconnect')
		this.dispatcher.emit('SocketReconnecting')
	}

	_OnSocketError(e) {
		console.log('<Socket> An error occured')
		console.log(e)
		this.dispatcher.emit('SocketError')
	}

	_OnSocketClosed() {
		console.log('<Socket> Connection closed')
		this.dispatcher.emit('SocketClosed')
	}

	_OnSocketEnded() {
		console.log('<Socket> Connection ended')
		this.client.destroy()
		this.client = null
		this.dispatcher.emit('SocketEnded')
	}

	/**
	 * Log out from the game server
	 * @param {string} reason Reason to log-out the user
	 * @returns {Socket}
	 */
	disconnect(reason) {
		this.send('disconnecting', reason)
		this.client.destroy()
		this.client = null
		return this
	}

	/**
	 * Send something to the server
	 * @param {string} call Name of the packet to send
	 * @param {object} data JSON data to send
	 * @returns {Socket}
	 */
	send(call, data) {
		if (!this.client) {
			throw new Error('Trying to send data to an unavailable connection.')
		}

		this.client.write({ call, data })
		return this
	}

	/**
	 * Send a packet to the server
	 * @param {string} type Name of the packet to send
	 * @param {object} data JSON data to send
	 * @returns {Socket}
	 */
	sendMessage(type, data) {
		return this.send('sendMessage', { type, data })
	}

	/**
	 * Wrap socket events
	 * @returns {EventWrapper}
	 */
	createWrapper() {
		return new EventWrapper(this.dispatcher)
	}

	/**
	 * Mounting
	 * @returns {Socket}
	 */
	mount() {
		this.dispatcher = new EventEmitter()
		return this
	}

	/**
	 * Unmouting
	 * @returns {Socket}
	 * @todo Investigate for an existing reason that we can use
	 */
	unmount() {
		if (this.client !== null) {
			this.disconnect('NO_REASON')
		}

		this.dispatcher = null
		return this
	}
}