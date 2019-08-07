import { ucLower } from './libs/helper'

export default class PluginLoader {
  private _plugins: Map<string, any> = new Map()
  private _clients: any[] = []

  public registerDefaults(): this
  {
    return this
      .add(require('./plugins/auth'))
      .add(require('./plugins/game'))
  }

  public add(plugin: any): this
  {
    const { name } = plugin.describe()
    if (this._plugins.has(name)) {
      throw new Error('A plugin with the same name are already registered.')
    }

    this._plugins.set(name, plugin)
    return this
  }

  public remove(plugin: any): this
  {
    const { name } = plugin.describe()
    if (!this._plugins.has(name)) {
      throw new Error('Unable to find a registered plugin with this name.')
    }

    this._plugins.delete(name)
    return this
  }

  public attach(client: any): this
  {
    if ('_pluginLoader' in client.data) {
      throw new Error('Attempting to attach an already attached client.')
    }

    client.data._pluginLoader = { wrappers: {} }
    this._clients.push(client)
    return this
  }

  public refreshClients(): this
  {
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

  _getContext(client: any): any
  {
    const context = {}
    Object.defineProperty(context, 'socket', { get: () => client.socket })
    Object.defineProperty(context, 'rootData', { get: () => client.data })
    return context
  }

  _getScope(client: any, plugin: any): any
  {
    const info = plugin.describe()
    const name = ucLower(info.name)
    const _wrapper = client.data._pluginLoader.wrappers[name]
    const scope = Object.assign(client.data[name], plugin.methods, { _wrapper })
    return scope
  }

  _fillData(client: any, plugin: any): this
  {
    const info = plugin.describe()
    const name = ucLower(info.name)
    if (name in client.data) return this

    client.data[name] = plugin.data()
    client.data._pluginLoader.wrappers[name] = client.socket.createWrapper()
    return this
  }

  _fillApi(client: any, plugin: any): this
  {
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

    return this
  }

  _subscribeEvents(client: any, plugin: any): this
  {
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
  unregister(plugin): this
  {
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