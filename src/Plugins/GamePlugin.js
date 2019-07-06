const { generateString } = require('../Libs/Helper')

module.exports = {
    describe: () => ({
        name: 'Game',
        description: 'Handle game protocol'
    }),
    data: () => ({
        sessionId: null,
        serverId: null,
        serverIp: null,
        serverPort: null,
        serverTicket: null,
        sequenceNumberRequestMessageValue: 0,

    }),
    subscribers: {
        OnIdentificationSuccessMessage(ctx, { login }) {
            this.sessionId = login
        },
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
        },
        OnHelloGameMessage(ctx, packet) {
            ctx.socket.sendMessage('AuthenticationTicketMessage', {
                ticket: this.serverTicket,
                lang: ctx.rootData.Client.language
            })
        },
        OnTrustStatusMessage(ctx, packet) {
            ctx.socket.sendMessage('CharactersListRequestMessage')
        },
        OnCharacterSelectedForceMessage(ctx, packet) {
            ctx.socket.sendMessage('CharacterSelectedForceReadyMessage')
        },
        OnCharacterSelectedSuccessMessage(ctx, packet) {
            ctx.socket.send('moneyGoultinesAmountRequest')
            ctx.socket.sendMessage('QuestListRequestMessage')
            ctx.socket.sendMessage('FriendsGetListMessage')
            ctx.socket.sendMessage('IgnoredGetListMessage')
            ctx.socket.sendMessage('SpouseGetInformationsMessage')
            ctx.socket.send('bakSoftToHardCurrentRateRequest')
            ctx.socket.send('bakHardToSoftCurrentRateRequest')
            ctx.socket.send('kpiStartSession', {
                accountSessionId: this.sessionId,
                isSubscriber: false
            })
            ctx.socket.sendMessage('ClientKeyMessage', { key: generateString(20) })
            ctx.socket.send('restoreMysteryBox')
            ctx.socket.sendMessage('GameContextCreateRequestMessage')
            this.antiInactivityInterval = setInterval(() => {
                ctx.socket.sendMessage('BasicPingMessage', { quit: false })
            }, 600000)
        },
        OnSequenceNumberRequestMessage(ctx, packet) {
            ctx.socket.sendMessage('SequenceNumberMessage', {
                number: ++this.sequenceNumberRequestMessageValue
            })
        },
        OnGameContextCreateMessage(ctx, packet) {
            ctx.socket.sendMessage('ObjectAveragePricesGetMessage')
        },
        OnBasicLatencyStatsRequestMessage(ctx, packet) {
            ctx.socket.sendMessage('BasicLatencyStatsMessage', {
                latency: 262,
                max: 50,
                sampleCount: 12
            })
        }
    },
    methods: {
        connect(ctx) {
            return ctx.socket.connect('Game', ctx.rootData.Credentials.sticker)
        },
        play(ctx, characterId) {
            return ctx.socket.sendMessage('CharacterSelectionMessage', { id: characterId })
        }
    },
    mounted() {

    },
    unmounted() {

    }
}