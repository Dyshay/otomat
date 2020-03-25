## A propos
**@dofus-remote/plugins** est un dépôt contenant de quelques plugins permettant une gestion de base de votre [@dofus-remote/client](https://github.com/dofus-remote/client).

## Exemple
```js
const Client = require('@dofus-remote/client')
const Plugins = require('@dofus-remote/plugins')

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

    for (const plugin of Plugins.getArray()) {
        player.plugins.register(plugin)
    }

    await account.authenticate(login, password)
    await account.api.auth.connect()
    await account.api.auth.play(serverId)
    await account.api.game.play(characterId)
    
    console.log(account.data.characterInventory.items)
}

const [ login, password, serverId, characterId ] = process.argv.slice(2, 6)
run(login, password, serverId, characterId)
    .then(() => console.log('Why are you runnin\''))
    .catch(console.error)
````

## Contact
Je suis quasiment toujours disponible sur [Discord](https://discordapp.com) sous le nom de `Tanuki#0003`.