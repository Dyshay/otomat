const Constants = require('./configurations/constants')

const DataManager = require('./libs/Data')
const Socket = require('./libs/Socket')
const PluginLoader = require('./libs/plugin-loader')
const TokenManager = require('./libs/token-manager')

const AuthPlugin = require('./plugins/auth.plugin')
const GamePlugin = require('./plugins/game.plugin')

const { generateString } = require('./libs/Helper')

module.exports = class Client {
    constructor(clientSettings) {
        this.Api = {}
        this.Data = new DataManager(clientSettings)
        this.Socket = new Socket(clientSettings.primus)
        this.Plugins = new PluginLoader(this)
    }

    registerDefaultPlugins() {
        this.Plugins.register(AuthPlugin)
        this.Plugins.register(GamePlugin)
        return this
    }

    unregisterDefaultPlugins() {
        this.Plugins.unregister(AuthPlugin)
        this.Plugins.unregister(GamePlugin)
        return this
    }

    async authenticate(login, password) {
        const { data: { key } } = await TokenManager.getApiKey(login, password, true)
        const { data: { token } } = await TokenManager.getToken(key)
        const sticker = generateString(15)
        this.Data.Credentials = { sticker, userToken: token, userName: login }
    }

    mount() {
        this.Socket.mount()
        return this
    }

    unmount() {
        this.Socket.unmount()
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