import { getJson } from './helper'

const CreateApiKey = 'https://haapi.ankama.com/json/Ankama/v2/Api/CreateApiKey?why_use=cloudscraper'
const CreateToken =
  'https://haapi.ankama.com/json/Ankama/v2/Account/CreateToken?game=18'

export function getApiKey(login: string, password: string, isLongLifeToken: boolean): Promise<any> {
  return getJson(CreateApiKey, {
    method: 'POST',
    data: String(
      new URLSearchParams([
        ['login', login],
        ['password', password],
        ['long_life_token', String(+isLongLifeToken)]
      ])
    )
  })
}

export function getToken(key: string): Promise<any> {
  return getJson(CreateToken, { headers: { apiKey: key } })
}
