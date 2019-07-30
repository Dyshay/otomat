const CreateApiKey = 'https://haapi.ankama.com/json/Ankama/v2/Api/CreateApiKey'
const CreateToken =
  'https://haapi.ankama.com/json/Ankama/v2/Account/CreateToken?game=18'
const { getJson } = require('./helper')

module.exports.getApiKey = (login, password, isLongLifeKey) => {
  return getJson(CreateApiKey, {
    method: 'POST',
    data: String(
      new URLSearchParams([
        ['login', login],
        ['password', password],
        ['long_life_key', isLongLifeKey]
      ])
    )
  })
}

module.exports.getToken = key => {
  return getJson(CreateToken, { headers: { apiKey: key } })
}
