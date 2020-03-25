const helper = require('./helper')

module.exports = class PluginLoader {
  constructor(kernel) {
    this.kernel = kernel
    this.plugins = new Map()
  }

  add(plugin) {
    const { name } = plugin.describe()
    if (this.plugins.has(name)) return null
    this.plugins.set(name, plugin)
    return this
  }

  remove(plugin) {
    const { name } = plugin.describe()
    this.plugins.delete(name)
    return this
  }

  flush() {
    for (const client of this.kernel.clients) {
      if (!client.data.hasOwnProperty('_pluginLoader'))
        client.data._pluginLoader = { wrappers: {} }

      for (const [ name, plugin ] of this.plugins) {
        helper.fillData(client, plugin)
        helper.fillApi(client, plugin)
        helper.subscribeEvents(client, plugin)

        if (plugin.mounted) {
          const scope = helper.getScope(client, plugin)
          const context = helper.getContext(client)
          plugin.mounted.call(scope, context)
        }
      }
    }
    return this
  }

  /**
   * @todo
   * 1. Unloading plugins during the run-time
   * 2. Check for cross plugins dependencies while unloading
   */
  unregister(plugin) {
    /*
    const info = plugin.describe()
    const name = ucLower(info.name)

    plugin._wrapper.unregisterAll()
    if (plugin.unmount) {
      plugin.unmount.call(this.__getScope(plugin), this._context)
    }
    delete this._client.api[name]
    delete this._client.data[name]
    */
    return this
  }
}