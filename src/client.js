const Socket = require('./libs/socket')
const TokenManager = require('./libs/token-manager')
const { generateString } = require('./libs/helper')
const signale = require('signale')

module.exports = class Client {
  constructor(settings) {
    this.api = {}
    this.data = { _client: settings }
    this.socket = new Socket(this.data._client.primus)
  }

  async authenticate(login, password) {
    const logger = new signale.Signale({ interactive: true })
    logger.await('[1/3] - Retrieving API key')
    const { key } = await TokenManager.getApiKey(login, password, true)
    logger.await('[2/3] - Retrieving account token')
    const { token } = await TokenManager.getToken(key)
    const sticker = generateString(15)
    this.data._credentials = { sticker, userToken: token, userName: login }
    logger.success('[3/3] - Authenticated')
  }

  mount() {
    signale.info('Mouting client')
    this.socket.mount()
    return this
  }

  unmount() {
    signale.info('Unmounting client')
    this.socket.unmount()
    return this
  }
}