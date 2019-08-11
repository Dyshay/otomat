import { EventEmitter } from 'events'
import EventWrapper from './event-wrapper'
import { ucFirst } from './helper'
import { Signale } from 'signale'
import { createSocket } from 'primus'

const AuthServer = 'https://proxyconnection.touch.dofus.com'
const GameServer = 'https://oshimogameproxy.touch.dofus.com'
const GameSocket = createSocket({ transformer: 'engine.io' })

enum ServerTypeEnum {
  NONE,
  LOGIN = 'Login',
  GAME = 'Game'
}

const signale = new Signale({
  types: {
    packet: {
      badge: '📦',
      color: 'blueBright',
      label: 'packet',
      logLevel: 'info'
    }
  }
})

export default class Socket {
  private serverType: ServerTypeEnum = ServerTypeEnum.NONE
  private dispatcher: EventEmitter = new EventEmitter()
  private primus: any = null
  private client: any = null

  /**
   * Make and maintain connection to the `serverType` corresponding server address
   * @param {string} phase Phase
   * @returns {Socket}
   */
  public connect(serverType: ServerTypeEnum, sticker: string): this {
    if (this.client !== null) {
      throw new Error('A connection has already in progress.')
    }

    const serverAddress =
      (serverType === ServerTypeEnum.LOGIN ? AuthServer : GameServer) +
      '?STICKER=' +
      sticker

    this.serverType = serverType
    this.client = new GameSocket(serverAddress, {
      manual: true,
      reconnect: {
        max: 5000,
        min: 500,
        retries: 0
      },
      strategy: 'disconnect, timeout'
    })

    this.client
      .on('open', this.onSocketOpened.bind(this))
      .on('data', this.onSocketDataReceived.bind(this))
      .on('reconnect', this.onSocketReconnecting.bind(this))
      .on('error', this.onSocketError.bind(this))
      .on('close', this.onSocketClosed.bind(this))
      .on('end', this.onSocketEnded.bind(this))
      .open()

    return this
  }

  private onSocketOpened(): void {
    signale.info('Connection opened')
    this.dispatcher.emit('SocketConnected')
  }

  private onSocketDataReceived(packet: any): void {
    signale.packet(`RCV ${packet._messageType}`)
    this.dispatcher.emit(ucFirst(packet._messageType), packet)
  }

  private onSocketReconnecting(): void {
    signale.warn('Trying to reconnect')
    this.dispatcher.emit('SocketReconnecting')
  }

  private onSocketError(e: Error): void {
    signale.error('An error occured')
    signale.error(e)
    this.dispatcher.emit('SocketError')
  }

  private onSocketClosed(): void {
    signale.info('<Socket> Connection closed')
    this.dispatcher.emit('SocketClosed')
  }

  private onSocketEnded(): void {
    signale.info('<Socket> Connection ended')
    this.client.destroy()
    this.client = null
    this.dispatcher.emit('SocketEnded')
  }

  /**
   * Log out from the game server
   * @param {string} reason Reason to log-out the user
   * @returns {Socket}
   * @todo Investigate for an existing reason that we can use
   */
  public disconnect(reason: string = 'NO_REASON'): this {
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
  public send(call: string, data: any): this {
    if (!this.client) {
      throw new Error('Trying to send data to an unavailable connection.')
    }

    signale.packet('SNT ' + (data && data.type ? data.type : call))
    this.client.write({ call, data })
    return this
  }

  /**
   * Send a packet to the server
   * @param {string} type Name of the packet to send
   * @param {object} data JSON data to send
   * @returns {Socket}
   */
  public sendMessage(type: string, data: any): this {
    return this.send('sendMessage', { type, data })
  }

  /**
   * Wrap socket events
   * @returns {EventWrapper}
   */
  public createWrapper(): EventWrapper {
    return new EventWrapper(this.dispatcher)
  }
}
