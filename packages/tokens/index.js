const { cURL, getJson } = require('./helper')
const CreateApiKey = 'https://haapi.ankama.com/json/Ankama/v2/Api/CreateApiKey'
const CreateToken = 'https://haapi.ankama.com/json/Ankama/v2/Account/CreateToken?game=18'


module.exports = {
  getApiKey(login, password, isLongLifeToken) {
    const payload = `login=${login}&password=${password}&long_life_token=${isLongLifeToken.toString()}`
    return cURL(CreateApiKey, payload)
  },
  getToken(key) {
    return getJson(CreateToken, { headers: { apiKey: key } })
  }
}
