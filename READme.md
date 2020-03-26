![DofusRemote Client](https://raw.githubusercontent.com/dofus-remote/otomat/wip/app.png)

**Otomat** est développé par une seule dans le seul but d'obtenir de nouvelles connaissances dans divers domaines. Les fonctionnalités ne seront pas poussées et toute aide est bienvenue afin de fournir une base de projet stable et propre.

Invitation Discord: https://discord.gg/Ctg86d4

## Packages
- `ignitor` -> CLI permettant l'orchestration de vos différents bots.
- `kernel` -> Noyaux gérant vos bots, plugins.
- `plugins` -> Ajoute les fonctionnalités aux bots.
- `tokens` -> Génère les tokens de connexion des bots.
- `versions` -> Récupère les dernières versions du jeu.

## Exemple
```js
const Kernel = require('@dofus-remote/kernel')
const Versions = require('@dofus-remote/versions')
const AuthPlugin = require('@dofus-remote/plugins/AuthPlugin')
const GamePlugin = require('@dofus-remote/plugins/GamePlugin')

async function run(login, password, country, language, serverId, characterId) {
    const versions = await Versions.get(country, language)
    const kernel = new Kernel(versions)
    kernel.plugins.add(AuthPlugin)
    kernel.plugins.add(GamePlugin)
    kernel.clients.add(login, password, language)
    kernel.plugins.flush()
    await kernel.clients.run(Array.from(kernel.clients))
    
    for (const client of kernel.clients) {
        await kernel.api.auth.begin(client)
        await kernel.api.auth.play(client, serverId)
        await kernel.api.game.play(client, characterId)
    }
}

run('login', 'password', 'country', 'language', 0, 0)
    .then(console.log)
    .catch(console.error)
```