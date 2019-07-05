module.exports = {
    describe: () => ({
        name: 'AuthPlugin',
        description: 'Handle authentication protocol'
    }),
    data: () => ({
        sessionId: null,
        key: null,
        salt: null,
        serverId: null,
        serverIp: null,
        serverPort: null,
        serverTicket: null,
        servers: []
    }),
    subscribers: {
        OnSocketConnected(ctx) {
            ctx.network.send('connecting', {
                'language': 'fr',
                'server': 'login',
                'client': 'android',
                'appVersion': '1.16.9',
                'buildVersion': '1.42.5'
            })
        },
        OnIdentificationSuccessMessage(ctx, { login }) {
            this.sessionId = login
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

            ctx.network.send('checkAssetsVersion', {
                staticDataVersion: '1.11.11',
                assetsVersion: '2.27.2b'
            })
        },
        OnAssetsVersionChecked(ctx) {
            ctx.network.send('login', {
                key: this.key,
                salt: this.salt,
                token: ctx.rootData.Credentials.userToken,
                username: ctx.rootData.Credentials.userName
            })
        },
        OnServersListMessage(ctx, { servers }) {
            this.servers = servers
        },
        OnSelectedServerDataMessage(ctx, { serverId, address, port, ticket }) {
            this.serverId = serverId
            this.serverIp = address
            this.serverPort = port
            this.serverTicket = ticket
        }
    },
    methods: {
        play(ctx, serverId) {
            return ctx.network.sendMessage('ServerSelectionMessage', { serverId })
        }
    },
    mounted() {

    },
    unmounted() {

    }
}