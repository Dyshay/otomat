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
        Object.defineProperty(context, 'network', { get: () => this._client.Network })
        Object.defineProperty(context, 'rootData', { get: () => this._client.Data })
        return context
    }

    register(plugin) {
        this._register(plugin)
        this._subscribe(plugin)
        this._plugins.push(plugin)
        return this
    }

    _register(plugin) {
        const information = plugin.describe()
        console.log(information)

        if (this._client.Data[information.name] !== undefined)
            throw new Error('A plugin with the same name are already loaded.')

        this._client.Data[information.name] = plugin.data()
        plugin._wrapper = this._client.Network.createWrapper()
        return this
    }

    _subscribe(plugin) {
        const info = plugin.describe()
        const wrapper = plugin._wrapper

        for (const subscriberName in plugin.subscribers) {
            if (!/^On/.test(subscriberName))
                throw new Error(`Invalid subscriber name <${subscriberName}>`)
            
            const subscriber = plugin.subscribers[subscriberName]
            const eventName = subscriberName.slice(2)
            wrapper.on(eventName, (...args) => {
                const scope = Object.assign(this._client.Data[info.name], plugin.methods)
                subscriber.call(scope, this._context, ...args)
            })
        }

        return this
    }

    unregister(plugin) {
        return this
    }
}

module.exports = PluginLoader