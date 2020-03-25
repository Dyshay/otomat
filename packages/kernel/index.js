const ClientLoader = require('./loaders/client')
const PluginLoader = require('./loaders/plugin')

module.exports = class Kernel {
  constructor(versions) {
    this.versions = versions
    this.plugins = new PluginLoader(this)
    this.clients = new ClientLoader(this)
    this.api = {}
  }
}