const Constants = require('./Configurations/constants')

const DataManager = require('./Libs/Data')
const Network = require('./Libs/Network')
const PluginLoader = require('./Libs/PluginLoader')
const TokenManager = require('./Libs/TokenManager')

const AuthPlugin = require('./Plugins/AuthPlugin')
const GamePlugin = require('./Plugins/GamePlugin')

const { generateString } = require('./Libs/Helper')

module.exports = class Client {
    constructor(clientSettings) {
        this.Api = {}
        this.Data = new DataManager(clientSettings)
        this.Network = new Network(clientSettings.primus)
        this.Plugins = new PluginLoader(this)
    }

    registerDefaultPlugins() {
        this.Plugins.register(AuthPlugin)
        return this
    }

    unregisterDefaultPlugins() {
        this.Plugins.unregister(AuthPlugin)
        return this
    }

    async connect(login, password) {
		const { data: { key } } = await TokenManager.getApiKey(login, password, true)
        const { data: { token } } = await TokenManager.getToken(key)
        const sticker = generateString(15)
        this.Data.Credentials = { sticker, userToken: token, userName: login }
        const wrapper = this.Network.createWrapper()
        const hasServers = wrapper.once('ServersListMessage')
        this.Network.connect(Constants.Servers.Auth + '?STICKER=' + sticker)
        return hasServers
    }

    mount() {
        this.Network.mount()
        return this
    }

    unmount() {
        this.Network.unmount()
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