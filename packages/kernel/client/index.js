const TokenManager = require('@dofus-remote/tokens')
const Socket = require('./libs/socket')
const { generateString } = require('./libs/helper')
const { Signale } = require('signale')

module.exports = class Client {
  constructor(login, password) {
    this.socket = new Socket()
    this.data = {}
    this.data._credentials = { login, password }
  }

  async run() {
    const logger = new Signale({ interactive: true })
    logger.await('[1/3] - Retrieving API key')
    const { login, password } = this._credentials
    const { key } = await TokenManager.getApiKey(login, password, true)
    logger.await('[2/3] - Retrieving account token')
    const { token } = await TokenManager.getToken(key)
    this._credentials.sticker = generateString(15)
    this._credentials.clientKey = generateString(20)
    this._credentials.token = token
    logger.success('[3/3] - Authenticated')
  }

  stop() {
    
  }
}