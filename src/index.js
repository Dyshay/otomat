const DataManager = require('./libs/Data')
const Socket = require('./libs/Socket')
const PluginLoader = require('./libs/plugin-loader')
const TokenManager = require('./libs/token-manager')

const AuthPlugin = require('./plugins/auth.plugin')
const GamePlugin = require('./plugins/game.plugin')

const { generateString } = require('./libs/helper')

module.exports = class Client {
    constructor(clientSettings) {
        this.api = {}
        this.data = new DataManager(clientSettings)
        this.socket = new Socket(clientSettings.primus)
        this.plugins = new PluginLoader(this)
    }

    registerDefaultPlugins() {
        this.plugins.register(AuthPlugin)
        this.plugins.register(GamePlugin)
        return this
    }

    unregisterDefaultPlugins() {
        this.plugins.unregister(AuthPlugin)
        this.plugins.unregister(GamePlugin)
        return this
    }

    async authenticate(login, password) {
        const { data: { key } } = await TokenManager.getApiKey(login, password, true)
        const { data: { token } } = await TokenManager.getToken(key)
        const sticker = generateString(15)
        this.data.credentials = { sticker, userToken: token, userName: login }
    }

    mount() {
        this.socket.mount()
        return this
    }

    unmount() {
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