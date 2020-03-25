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
    characters: [],
    hasStartupActions: false
  }),
  subscribers: {
    IdentificationSuccessMessage(ctx, { login }) {
      this.sessionId = login
    },
    SelectedServerDataMessage(ctx, { serverId, address, port, ticket }) {
      this.serverId = serverId
      this.serverIp = address
      this.serverPort = port
      this.serverTicket = ticket
    },
    SelectedServerRefusedMessage(ctx, { serverId, error, serverStatus }) {},
    SocketEnded(ctx) {
      if (ctx.socket.serverType !== 'Login') return
      this.connect(ctx)
    },
    SocketConnected(ctx) {
      if (ctx.socket.serverType !== 'Game' || this.serverIp === null) return
      ctx.socket.send('connecting', {
        language: ctx.rootData._client.language,
        server: {
          address: this.serverIp,
          port: this.serverPort,
          id: this.serverId
        },
        client: 'android',
        appVersion: ctx.rootData._client.appVersion,
        buildVersion: ctx.rootData._client.buildVersion
      })
    },
    HelloGameMessage(ctx, packet) {
      ctx.socket.sendMessage('AuthenticationTicketMessage', {
        ticket: this.serverTicket,
        lang: ctx.rootData._client.language
      })
    },
    TrustStatusMessage(ctx, packet) {
      ctx.socket.sendMessage('CharactersListRequestMessage')
    },
    CharactersListMessage(ctx, packet) {
      this.characters = packet.characters
      this.hasStartupActions = packet.hasStartupActions
    },
    CharacterSelectedForceMessage(ctx, packet) {
      ctx.socket.sendMessage('CharacterSelectedForceReadyMessage')
    },
    CharacterSelectedSuccessMessage(ctx, packet) {
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
      ctx.socket.sendMessage('ClientKeyMessage', { key: ctx.rootData._credentials.clientKey })
      ctx.socket.send('restoreMysteryBox')
      ctx.socket.sendMessage('GameContextCreateRequestMessage')
      this.antiInactivityInterval = setInterval(() => {
        ctx.socket.sendMessage('BasicPingMessage', { quiet: false })
      }, 600000)
    },
    SequenceNumberRequestMessage(ctx, packet) {
      ctx.socket.sendMessage('SequenceNumberMessage', {
        number: ++this.sequenceNumberRequestMessageValue
      })
    },
    GameContextCreateMessage(ctx, packet) {
      ctx.socket.sendMessage('ObjectAveragePricesGetMessage')
    },
    BasicLatencyStatsRequestMessage(ctx, packet) {
      ctx.socket.sendMessage('BasicLatencyStatsMessage', {
        latency: 262,
        max: 50,
        sampleCount: 12
      })
    }
  },
  methods: {
    begin(ctx) {
      ctx.socket.connect('Game', ctx.rootData._credentials.sticker)
      return this._wrapper.once('CharactersListMessage')
    },
    play(ctx, characterId) {
      ctx.socket.sendMessage('CharacterSelectionMessage', { id: characterId })
      return this._wrapper.once('CharacterSelectedSuccessMessage')
    }
  },
  mounted() {},
  unmounted() {
    clearInterval(this.antiInactivityInterval)
  }
}
