const { ucLower } = require('../client/libs/helper')

module.exports = class PluginHelper {
  static getContext(client) {
    const context = {}
    Object.defineProperty(context, 'socket', { get: () => client.socket })
    Object.defineProperty(context, 'rootData', { get: () => client.data })
    return context
  }

  static getScope(client, plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)
    const _wrapper = client.data._pluginLoader.wrappers[name]
    const scope = Object.assign(client.data[name], plugin.methods, { _wrapper })
    return scope
  }

  static fillData(client, plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)
    if (name in client.data) return

    client.data[name] = plugin.data()
    client.data._pluginLoader.wrappers[name] = client.socket.createWrapper()
  }

  static fillApi(client, plugin) {
    const info = plugin.describe()
    const name = ucLower(info.name)
    if (name in client.api) return

    const scope = this.getScope(client, plugin)
    const context = this.getContext(client)
    client.api[name] = {}

    for (const methodName in plugin.methods) {
      const method = plugin.methods[methodName]
      client.api[name][methodName] = (...args) =>
        method.call(scope, context, ...args)
    }
  }

  static subscribeEvents(client, plugin) {
    const scope = this.getScope(client, plugin)
    const context = this.getContext(client)
    const pluginName = ucLower(plugin.describe().name)
    const wrapper = client.data._pluginLoader.wrappers[pluginName]

    for (const subscriberName in plugin.subscribers) {
      const subscriber = plugin.subscribers[subscriberName]
      wrapper.on(subscriberName, (...args) => {
        subscriber.call(scope, context, ...args)
      })
    }
  }
}