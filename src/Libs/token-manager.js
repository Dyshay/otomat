const axios = require('axios')
const { Auth } = require('../configurations/constants')

module.exports.getApiKey = (login, password, isLongLifeKey) => {
  return axios({
    url: Auth.CreateApiKey,
    method: 'POST',
    responseType: 'json',
    data: new URLSearchParams([
      ['login', login],
      ['password', password],
      ['long_life_key', isLongLifeKey]
    ])
  })
}

module.exports.getToken = key => {
  return axios({
    url: Auth.CreateToken,
    method: 'GET',
    responseType: 'json',
    headers: {
      apiKey: key
    }
  })
}
