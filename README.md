![DofusRemote Client](https://image.noelshack.com/fichiers/2019/27/7/1562519760-capture-d-ecran-2019-07-07-a-19-15-45.png)

## About
**@dofus-remote/client** has been developed for developers and can't do more than:
- Maintain a connection to the servers.
- Load plugins to extends core's possibilities.
- Join a server.
- Connect a character.

## Example
```js
/**
 * We're not doing everything.
 * - You must set the versions yourself.
 * - You must import the patched Primus yourself.
 */
const { Client, Settings, Credentials, PluginLoader } = require('@dofus-remote/client')
const Versions = require('@dofus-remote/versions')

;(async () => {
  // 1. Versions
  const versions = await Versions.getVersions()
  const settings = new Settings()
  settings.language = 'fr'
  settings.appVersion = versions.appVersion
  settings.buildVersion = versions.buildVersion
  settings.staticDataVersion = versions.staticDataVersion
  settings.assetsVersion = versions.assetsVersion
  settings.primus = require('./primus')

  // 2. Clients
  const client = new Client({ client: settings, credentials: new Credentials('login', 'password') })
  await client.authenticate()

  // 3. Plugins
  const plugins = new PluginLoader()
  plugins.registerDefaults()
  plugins.attach(client)
  plugins.refreshClients()

  // 4. API Calls
  await client.api.auth.connect()
  await client.api.auth.play(-1)
  await client.api.game.play(-1)
})().catch(console.error)
```

## Contact
You can contact `Tanuki#0003` by following this [discord's invitation](https://discord.gg/Ctg86d4).