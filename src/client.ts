import Socket from './libs/socket'
import * as TokenManager from './libs/token-manager'
import { generateString } from './libs/helper'
import { Signale } from 'signale'

export default class Client {
  public socket: Socket = new Socket()
  public api: any = {}
  public data: any

  constructor({ settings: _client, credentials: _credentials }) {
    this.data = { _client, _credentials }
  }

  async authenticate(): Promise<void> {
    const logger = new Signale({ interactive: true })
    logger.await('[1/3] - Retrieving API key')
    const { login, password } = this.data._credentials
    const { key } = await TokenManager.getApiKey(login, password, true)
    logger.await('[2/3] - Retrieving account token')
    const { token } = await TokenManager.getToken(key)
    this.data._credentials.sticker = generateString(15)
    this.data._credentials.clientKey = generateString(20)
    this.data._credentials.token = token
    logger.success('[3/3] - Authenticated')
  }
}