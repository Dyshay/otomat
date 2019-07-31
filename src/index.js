module.exports.PluginLoader = require('./plugin-loader')
module.exports.Client = require('./client')
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