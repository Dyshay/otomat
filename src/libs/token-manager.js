const { Auth } = require('../configurations/constants')
const { getJson } = require('./helper')

module.exports.getApiKey = (login, password, isLongLifeKey) => {
  return getJson(Auth.CreateApiKey, {
    method: 'POST',
    data: String(new URLSearchParams([
      ['login', login],
      ['password', password],
      ['long_life_key', isLongLifeKey]
    ]))
  })
}

module.exports.getToken = key => {
  return getJson(Auth.CreateToken, { headers: { apiKey: key } })
}
