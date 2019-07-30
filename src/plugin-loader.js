const { ucLower } = require('./libs/helper')

module.exports = class PluginLoader {
  constructor() {
    this._plugins = new Map()
    this._clients = []
  }

  add(plugin) {
    const { name } = plugin.describe()
    if (this._plugins.has(name)) {
      throw new Error('A plugin with the same name are already registered.')
    }

    this._plugins.set(name, plugin)
    return this
  }

  remove(plugin) {
    const { name } = plugin.describe()
    if (!this._plugins.has(name)) {
      throw new Errror('Unable to find a registered plugin with this name.')
    }

    this._plugins.delete(name)
    return this
  }

  attach(client) {
    if ('_pluginLoader' in client.data) {
      throw new Error('Attempting to attach an already attached client.')
    }

    client.data._pluginLoader = { wrappers: {} }
    this._clients.push(client)
    return this
  }

  refreshClients() {
    for (const client of this._clients) {
      for (const [ name, plugin ] of this._plugins) {
        this._fillData(client, plugin)
        this._fillApi(client, plugin)
        this._subscribeEvents(client, plugin)

        if (plugin.mount) {
          const scope = this._getScope(client, plugin)
          const context = this._getContext(client)
          plugin.mount.call(scope, context)
        }
      }
    }
    return this
  }

  _getContext(client) {
    const context = {}
    Object.defineProperty(context, 'socket', { get: () => client.socket })
    Object.defineProperty(context, 'rootData', { get: () => client.data })
    return context
  }

  _getScope(client, plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)
    const _wrapper = client.data._pluginLoader.wrappers[name]
    const scope = Object.assign(client.data[name], plugin.methods, { _wrapper })
    return scope
  }

  _fillData(client, plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)
    if (name in client.data) return this

    client.data[name] = plugin.data()
    client.data._pluginLoader.wrappers[name] = client.socket.createWrapper()
    return this
  }

  _fillApi(client, plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)
    if (name in client.api) return this

    const scope = this._getScope(client, plugin)
    const context = this._getContext(client)
    client.api[name] = {}

    for (const methodName in plugin.methods) {
      const method = plugin.methods[methodName]
      client.api[name][methodName] = (...args) =>
        method.call(scope, context, ...args)
    }
  }

  _subscribeEvents(client, plugin) {
    const scope = this._getScope(client, plugin)
    const context = this._getContext(client)
    const pluginName = ucLower(plugin.describe().name)
    const wrapper = client.data._pluginLoader.wrappers[pluginName]

    for (const subscriberName in plugin.subscribers) {
      const subscriber = plugin.subscribers[subscriberName]
      wrapper.on(subscriberName, (...args) => {
        subscriber.call(scope, context, ...args)
      })
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
      plugin.unmount.call(this._getScope(plugin), this._context)
    }
    delete this._client.api[name]
    delete this._client.data[name]
    */
    return this
  }
}