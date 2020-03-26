const Tokens = require('@dofus-remote/tokens')
const Socket = require('./libs/socket')
const { generateString } = require('./libs/hash')
const { Signale } = require('signale')

module.exports = class Client {
  constructor(settings) {
    this._password = settings.password
    delete settings.password

    this.settings = settings
    this.socket = new Socket()
    this.data = {}
  }

  async run() {
    const logger = new Signale({ interactive: true })
    logger.await('[1/3] - Retrieving API key')
    const { key } = await Tokens.createApiKey(this.settings.login, this._password, false)
    delete this._password
    logger.await('[2/3] - Retrieving account token')
    const { token } = await Tokens.createToken({ game: 18 }, key)
    this.settings.sticker = generateString(15)
    this.settings.clientKey = generateString(20)
    this.settings.token = token
    logger.success('[3/3] - Authenticated')
  }

  stop() {
    
  }
}