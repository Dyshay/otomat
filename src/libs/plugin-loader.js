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

  _getScope(plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)
    const scope = Object.assign(this._client.data[name], plugin.methods, {
      _wrapper: plugin._wrapper
    })
    return scope
  }

  register(plugin) {
    this._register(plugin)
    this._subscribe(plugin)
    this._feedApi(plugin)
    this._plugins.push(plugin)
    return this
  }

  _register(plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)

    if (this._client.data[name] !== undefined) {
      throw new Error('A plugin with the same name are already loaded.')
    }

    this._client.data[name] = plugin.data()
    plugin._wrapper = this._client.socket.createWrapper()
    return this
  }

  _feedApi(plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)
    const scope = this._getScope(plugin)

    this._client.api[name] = {}
    for (const methodName in plugin.methods) {
      const method = plugin.methods[methodName]
      this._client.api[name][methodName] = (...args) =>
        method.call(scope, this._context, ...args)
    }
  }

  _subscribe(plugin) {
    const scope = this._getScope(plugin)
    for (const subscriberName in plugin.subscribers) {
      const subscriber = plugin.subscribers[subscriberName]
      plugin._wrapper.on(subscriberName, (...args) => {
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
