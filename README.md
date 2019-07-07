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
const Client = require('@dofus-remote/client')

const clientSettings = new Client.Settings()
clientSettings.language = 'en'
clientSettings.appVersion = null
clientSettings.buildVersion = null
clientSettings.staticDataVersion = null
clientSettings.assetsVersion = null
clientSettings.primus = require('./primus')

async function run(login, password, serverId, characterId) {
    const player = new Client(clientSettings)
    player.mount()
    player.registerDefaultPlugins()
    
    await player.authenticate(login, password)
    await player.api.auth.connect()
    await player.api.auth.play(serverId)
    await player.api.game.play(characterId)
}

const [ login, password, serverId, characterId ] = process.argv.slice(2, 6)
run(login, password, serverId, characterId)
    .then(() => console.log('Why are you runnin\''))
    .catch(console.error)
```

## Contact
You can contact `Tanuki#0003` by following this [discord's invitation](https://discord.gg/Ctg86d4).