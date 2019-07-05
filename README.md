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
const Client = require('@dofus-remote/client')

const clientSettings = new Client.Settings()
clientSettings.language = 'en'
clientSettings.appVersion = null
clientSettings.buildVersion = null
clientSettings.staticDataVersion = null
clientSettings.assetsVersion = null
clientSettings.primus = require('./primus')

async function run(login, password) {
    const player = new Client(clientSettings)
    player.mount()
    player.registerDefaultPlugins()
    await player.connect(login, password)
    await player.Api.Auth.play(-1)
    await player.Api.Game.play(-1)
}

const [ login, password ] = process.argv.slice(2, 4)
run(login, password)
    .then(() => console.log('Why are you runnin\''))
    .catch(console.error)
```

## Contact
You can contact `Tanuki#0003` by following this [discord's invitation](https://discord.gg/Ctg86d4).