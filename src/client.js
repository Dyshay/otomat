const Socket = require('./libs/socket')
const TokenManager = require('./libs/token-manager')
const { generateString } = require('./libs/helper')
const signale = require('signale')

module.exports = class Client {
  constructor({ settings: _client, credentials: _credentials }) {
    this.api = {}
    this.data = { _client, _credentials }
    this.socket = new Socket(_client.primus)
  }

  async authenticate() {
    const logger = new signale.Signale({ interactive: true })
    logger.await('[1/3] - Retrieving API key')
    const { login, password } = this.data._credentials
    const { key } = await TokenManager.getApiKey(login, password, true)
    logger.await('[2/3] - Retrieving account token')
    const { token } = await TokenManager.getToken(key)
    const sticker = generateString(15)
    this.data._credentials.sticker = sticker
    this.data._credentials.userToken = token
    logger.success('[3/3] - Authenticated')
  }
}