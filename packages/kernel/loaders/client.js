const Client = require('../client')

module.exports = class ClientLoader {
  constructor(kernel) {
    this.kernel = kernel
    this.clients = new Map()
  }

  [Symbol.iterator]() {
    return this.clients.values()
  }

  add(login, password) {
    if (this.clients.has(login)) return null
    const client = new Client(login, password)
    this.clients.set(login, client)
    return client
  }

  remove(login) {
    this.clients.remove(login)
    return null
  }
}