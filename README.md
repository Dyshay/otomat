![DofusRemote Client](https://image.noelshack.com/fichiers/2019/27/7/1562519760-capture-d-ecran-2019-07-07-a-19-15-45.png)

## About
**@dofus-remote/client** has been developed for developers and can't do more than:
- Maintain a connection to the servers.
- Load plugins to extends core's possibilities.

There is some others functionalities like:
- Join a server (`auth`)
- Select a character (`game`)
- Manage character's inventory (`characterInventory`)

But for that you need to import these plugins from https://github.com/dofus-remote/plugins.

## Instructions
```sh
$ npm install
$ npm run build
```

## Example
```js
const { Client, Settings, Credentials, PluginLoader } = require('@dofus-remote/client')
const Versions = require('@dofus-remote/versions')
const AuthPlugin = require('@dofus-remote/plugins/auth')
const GamePlugin = require('@dofus-remote/plugins/game')

;(async () => {
  // 1. Versions
  const versions = await Versions.getVersions()
  const settings = new Settings()
  settings.language = 'fr'
  settings.appVersion = versions.appVersion
  settings.buildVersion = versions.buildVersion
  settings.staticDataVersion = versions.staticDataVersion
  settings.assetsVersion = versions.assetsVersion

  // 2. Clients
  const client = new Client({
    settings,
    credentials: new Credentials('login', 'password')
  })
  await client.authenticate()

  // 3. Plugins
  const plugins = new PluginLoader()
  plugins.add(AuthPlugin)
  plugins.add(GamePlugin)
  plugins.attach(client)
  plugins.flush()

  // 4. API Calls
  await client.api.auth.connect()
  await client.api.auth.play(-1)
  await client.api.game.play(-1)
})().catch(console.error)
```

## Contact
You can contact `Tanuki#0003` by following this [discord's invitation](https://discord.gg/Ctg86d4).