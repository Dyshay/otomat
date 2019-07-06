module.exports = {
    describe: () => ({
        name: 'Game',
        description: 'Handle game protocol'
    }),
    data: () => ({
        serverId: null,
        serverIp: null,
        serverPort: null,
        serverTicket: null
    }),
    subscribers: {
        OnSelectedServerDataMessage(ctx, { serverId, address, port, ticket }) {
            this.serverId = serverId
            this.serverIp = address
            this.serverPort = port
            this.serverTicket = ticket
        },
        OnSelectedServerRefusedMessage(ctx, { serverId, error, serverStatus }) {

        },
        OnSocketEnded(ctx) {
            if (ctx.socket.serverType !== 'Login') return
            this.connect(ctx)
        },
        OnSocketConnected(ctx) {
            if (ctx.socket.serverType !== 'Game' || this.serverIp === null) return
            ctx.socket.send('connecting', {
                'language': ctx.rootData.Client.language,
                'server': {
                    'address': this.serverIp,
                    'port': this.serverPort,
                    'id': this.serverId
                },
                'client': 'android',
                'appVersion': ctx.rootData.Client.appVersion,
                'buildVersion': ctx.rootData.Client.buildVersion
            })
        }
    },
    methods: {
        connect(ctx) {
            return ctx.socket.connect('Game', ctx.rootData.Credentials.sticker)
        }
    },
    mounted() {

    },
    unmounted() {

    }
}