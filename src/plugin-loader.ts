import { ucLower } from './libs/helper'
import { Client } from '.'
import { Plugins } from './typings/Plugins'

export default class PluginLoader {
  private plugins: Map<string, Plugins.IPlugin> = new Map()
  private clients: Client[] = []

  public add(plugin: Plugins.IPlugin): this {
    const { name } = plugin.describe()
    if (this.plugins.has(name)) {
      throw new Error('A plugin with the same name are already registered.')
    }

    this.plugins.set(name, plugin)
    return this
  }

  public remove(plugin: Plugins.IPlugin): this {
    const { name } = plugin.describe()
    if (!this.plugins.has(name)) {
      throw new Error('Unable to find a registered plugin with this name.')
    }

    this.plugins.delete(name)
    return this
  }

  public attach(client: Client): this {
    if ('_pluginLoader' in client.data) {
      throw new Error('Attempting to attach an already attached client.')
    }

    client.data._pluginLoader = { wrappers: {} }
    this.clients.push(client)
    return this
  }

  public flush(): this {
    for (const client of this.clients) {
      for (const [ name, plugin ] of this.plugins) {
        this.fillData(client, plugin)
        this.fillApi(client, plugin)
        this.subscribeEvents(client, plugin)

        if (plugin.mounted) {
          const scope = this.getScope(client, plugin)
          const context = this.getContext(client)
          plugin.mounted.call(scope, context)
        }
      }
    }
    return this
  }

  private getContext(client: Client): Plugins.IContext {
    const context = {}
    Object.defineProperty(context, 'socket', { get: () => client.socket })
    Object.defineProperty(context, 'rootData', { get: () => client.data })
    return <Plugins.IContext>context
  }

  private getScope(client: Client, plugin: Plugins.IPlugin): any {
    const info = plugin.describe()
    const name = ucLower(info.name)
    const _wrapper = client.data._pluginLoader.wrappers[name]
    const scope = Object.assign(client.data[name], plugin.methods, { _wrapper })
    return scope
  }

  private fillData(client: Client, plugin: Plugins.IPlugin): this {
    const info = plugin.describe()
    const name = ucLower(info.name)
    if (name in client.data) return this

    client.data[name] = plugin.data()
    client.data._pluginLoader.wrappers[name] = client.socket.createWrapper()
    return this
  }

  private fillApi(client: Client, plugin: Plugins.IPlugin): this {
    const info = plugin.describe()
    const name = ucLower(info.name)
    if (name in client.api) return this

    const scope = this.getScope(client, plugin)
    const context = this.getContext(client)
    client.api[name] = {}

    for (const methodName in plugin.methods) {
      const method = plugin.methods[methodName]
      client.api[name][methodName] = (...args) =>
        method.call(scope, context, ...args)
    }

    return this
  }

  private subscribeEvents(
    client: Client, 
    plugin: Plugins.IPlugin
  ): this {
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

    return this
  }

  /**
   * @todo
   * 1. Unloading plugins during the run-time
   * 2. Check for cross plugins dependencies while unloading
   */
  unregister(plugin: unknown): this {
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