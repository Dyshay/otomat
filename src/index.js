const Socket = require('./libs/socket')
const PluginLoader = require('./libs/plugin-loader')
const TokenManager = require('./libs/token-manager')

const AuthPlugin = require('./plugins/auth.plugin')
const GamePlugin = require('./plugins/game.plugin')

const signale = require('signale')
const { generateString } = require('./libs/helper')

module.exports = class Client {
  constructor(clientSettings) {
    this.api = {}
    this.data = { client: clientSettings }
    this.socket = new Socket(this.data.client.primus)
    this.plugins = new PluginLoader(this)
  }

  registerDefaultPlugins() {
    signale.info('Registering default plugins')
    this.plugins.register(AuthPlugin)
    this.plugins.register(GamePlugin)
    return this
  }

  unregisterDefaultPlugins() {
    signale.info('Unregistering default plugins')
    this.plugins.unregister(AuthPlugin)
    this.plugins.unregister(GamePlugin)
    return this
  }

  async authenticate(login, password) {
    const logger = new signale.Signale({ interactive: true })
    logger.await('[1/3] - Retrieving API key')
    const { data: { key } } = await TokenManager.getApiKey(login, password, true)
    logger.await('[2/3] - Retrieving account token')
    const { data: { token } } = await TokenManager.getToken(key)
    const sticker = generateString(15)
    this.data.credentials = { sticker, userToken: token, userName: login }
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

module.exports.Settings = class Settings {
  constructor() {
    this.language = null
    this.appVersion = null
    this.buildVersion = null
    this.staticDataVersion = null
    this.assetsVersion = null
    this.primus = null
  }
}