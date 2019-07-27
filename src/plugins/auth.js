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
    SocketConnected(ctx) {
      if (ctx.socket.serverType !== 'Login') return
      ctx.socket.send('connecting', {
        language: ctx.rootData.client.language,
        server: 'login',
        client: 'android',
        appVersion: ctx.rootData.client.appVersion,
        buildVersion: ctx.rootData.client.buildVersion
      })
    },
    ProtocolRequired() {
    },
    ConnectionFailedMessage() {
    },
    HelloConnectMessage(ctx, { salt, key }) {
      this.salt = salt
      this.key = key

      ctx.socket.send('checkAssetsVersion', {
        staticDataVersion: ctx.rootData.client.staticDataVersion,
        assetsVersion: ctx.rootData.client.assetsVersion
      })
    },
    AssetsVersionChecked(ctx) {
      ctx.socket.send('login', {
        key: this.key,
        salt: this.salt,
        token: ctx.rootData.credentials.userToken,
        username: ctx.rootData.credentials.userName
      })
    },
    ServersListMessage(ctx, { servers }) {
      this.servers = servers
    }
  },
  methods: {
    connect(ctx) {
      const servers = this._wrapper.once('ServersListMessage')
      ctx.socket.connect('Login', ctx.rootData.credentials.sticker)
      return servers
    },
    play(ctx, serverId) {
      const characters = this._wrapper.once('CharactersListMessage')
      ctx.socket.sendMessage('ServerSelectionMessage', { serverId })
      return characters
    }
  },
  mounted() {},
  unmounted() {}
}
