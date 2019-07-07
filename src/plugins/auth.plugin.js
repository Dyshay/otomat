module.exports = {
    describe: () => ({
        name: 'Auth',
        description: 'Handle authentication protocol'
    }),
    data: () => ({
        key: null,
        salt: null,
        servers: []
    }),
    subscribers: {
        OnSocketConnected(ctx) {
            if (ctx.socket.serverType !== 'Login') return
            ctx.socket.send('connecting', {
                'language': ctx.rootData.Client.language,
                'server': 'login',
                'client': 'android',
                'appVersion': ctx.rootData.Client.appVersion,
                'buildVersion': ctx.rootData.Client.buildVersion
            })
        },
        OnProtocolRequired() {
            console.log('OnProtocolRequired')
        },
        OnConnectionFailedMessage() {
            console.log('OnConnectionFailedMessage')
        },
        OnHelloConnectMessage(ctx, { salt, key }) {
            this.salt = salt
            this.key = key

            ctx.socket.send('checkAssetsVersion', {
                staticDataVersion: ctx.rootData.Client.staticDataVersion,
                assetsVersion: ctx.rootData.Client.assetsVersion
            })
        },
        OnAssetsVersionChecked(ctx) {
            ctx.socket.send('login', {
                key: this.key,
                salt: this.salt,
                token: ctx.rootData.Credentials.userToken,
                username: ctx.rootData.Credentials.userName
            })
        },
        OnServersListMessage(ctx, { servers }) {
            this.servers = servers
        }
    },
    methods: {
        connect(ctx) {
            const wrapper = ctx.socket.createWrapper()
            const servers = wrapper.once('ServersListMessage')
            ctx.socket.connect('Login', ctx.rootData.Credentials.sticker)
            return servers
        },
        play(ctx, serverId) {
            const wrapper = ctx.socket.createWrapper()
            const characters = wrapper.once('CharactersListMessage')
            ctx.socket.sendMessage('ServerSelectionMessage', { serverId })
            return characters
        }
    },
    mounted() {

    },
    unmounted() {

    }
}