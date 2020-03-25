# @dofus-remote/versions
## Example
```js
const versions = require('@dofus-remote/versions')

(async () => {
    const res = await versions.getVersions()
    
    console.log('appVersion', res.appVersion)
    console.log('buildVersion', res.buildVersion)
    console.log('assetsVersion', res.assetsVersion)
    console.log('staticDataVersion', res.staticDataVersion)
})().catch(console.error)
```

## Contact
You can contact `Tanuki#0003` by following this [discord's invitation](https://discord.gg/Ctg86d4).