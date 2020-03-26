module.exports = {
  describe: () => ({
    name: 'Auth',
    key: 'auth',
    description: 'Handle authentication protocol'
  }),
  data: () => ({
    key: null,
    salt: null,
    servers: []
  }),
  subscribers: {
    SocketConnected(ctx) {
      if (ctx.socket.serverType !== 'Login') return
      ctx.socket.send('connecting', {
        language: ctx.settings.language,
        server: 'login',
        client: 'android',
        appVersion: ctx.settings.appVersion,
        buildVersion: ctx.settings.buildVersion
      })
    },
    ProtocolRequired() {},
    ConnectionFailedMessage() {},
    HelloConnectMessage(ctx, { salt, key }) {
      this.salt = salt
      this.key = key

      ctx.socket.send('login', {
        key: this.key,
        salt: this.salt,
        token: ctx.settings.token,
        username: ctx.settings.login
      })
    },
    IdentificationFailedMessage(ctx, { reason }) {},
    ServersListMessage(ctx, { servers }) {
      this.servers = servers
    }
  },
  methods: {
    begin(ctx) {
      ctx.socket.connect('Login', ctx.settings.sticker)
      return this._wrapper.once('ServersListMessage')
    },
    play(ctx, serverId) {
      ctx.socket.sendMessage('ServerSelectionMessage', { serverId })
      return this._wrapper.once('CharactersListMessage')
    }
  },
  mounted() {},
  unmounted() {}
}
