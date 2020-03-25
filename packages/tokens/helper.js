const { request } = require('https')
const { exec } = require('child_process')

module.exports = class Helper {
  /**
   * @param {string} url 
   * @param {object} options 
   * @returns {Promise<string>}
   */
  static getJson(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = request(url, options, res => {
        let data = ''
        res.on('data', chunk => (data += chunk))
        res.on('end', () => resolve(JSON.parse(data)))
      })

      req.on('error', err => reject(err))
      req.write(options.data || '')
      req.end()
    })
  }

  /**
   * @param {string} url 
   * @param {string} body 
   * @returns {Promise<object>}
   */
  static cURL(url, body) {
    return new Promise((resolve, reject) => {
      const query = `
            curl '${url}' \
            -H 'accept-language: fr' \
            -H 'user-agent: Dalvik/2.1.0 (Linux; U; Android 7.1.2; AFTMM Build/NS6264) CTV' \
            --data-binary '${body}' \
            --compressed
        `

      exec(query, (err, stdout) =>
        err ? reject(err) : resolve(JSON.parse(stdout))
      )
    })
  }
}