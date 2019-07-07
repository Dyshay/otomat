const { ucLower } = require('./helper')

/**
 * @class
 * @classdesc Handle Plugins
 */
class PluginLoader {
  /**
   * PluginLoader's constructor
   * @param {import('../index')} client
   */
  constructor(client) {
    this._client = client
    this._plugins = []
  }

  /**
   * Return the context to pass to a plugin's method
   * @returns {Object}
   */
  get _context() {
    const context = {}
    Object.defineProperty(context, 'socket', { get: () => this._client.socket })
    Object.defineProperty(context, 'rootData', { get: () => this._client.data })
    return context
  }

  register(plugin) {
    this._register(plugin)
    this._subscribe(plugin)
    this._feedApi(plugin)
    this._plugins.push(plugin)
    return this
  }

  _register(plugin, signale) {
    const info = plugin.describe()
    const name = ucLower(info.name)

    if (this._client.data[name] !== undefined) {
      throw new Error('A plugin with the same name are already loaded.')
    }

    this._client.data[name] = plugin.data()
    plugin._wrapper = this._client.socket.createWrapper()
    return this
  }

  _feedApi(plugin, signale) {
    const info = plugin.describe()
    const name = ucLower(info.name)

    this._client.api[name] = {}
    for (const methodName in plugin.methods) {
      const method = plugin.methods[methodName]
      this._client.api[name][methodName] = (...args) =>
        method(this._context, ...args)
    }
  }

  _subscribe(plugin, signale) {
    const info = plugin.describe()
    const name = ucLower(info.name)
    const wrapper = plugin._wrapper

    for (const subscriberName in plugin.subscribers) {
      if (!/^On/.test(subscriberName)) {
        throw new Error(`Invalid subscriber name <${subscriberName}>`)
      } 

      const subscriber = plugin.subscribers[subscriberName]
      const eventName = subscriberName.slice(2)
      wrapper.on(eventName, (...args) => {
        const scope = Object.assign(this._client.data[name], plugin.methods)
        subscriber.call(scope, this._context, ...args)
      })
    }

    return this
  }

  unregister(plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)

    plugin._wrapper.unregisterAll()
    delete this._client.api[name]
    delete this._client.data[name]
    return this
  }
}

module.exports = PluginLoader
