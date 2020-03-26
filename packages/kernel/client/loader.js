const Client = require('./index')

module.exports = class ClientLoader {
  constructor(kernel) {
    this.kernel = kernel
    this.clients = new Map()
  }

  [Symbol.iterator]() {
    return this.clients.values()
  }

  add(login, password, language) {
    if (this.clients.has(login)) return null
    const options = Object.assign({}, { login, password, language }, this.kernel.versions)
    const client = new Client(options)
    this.clients.set(login, client)
    return client
  }

  run(clients) {
    return Promise.all(clients.map(client => client.run()))
  }

  remove(login) {
    this.clients.remove(login)
    return null
  }
}