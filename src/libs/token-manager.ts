import { cURL, getJson } from './helper'

const CreateApiKey = 'https://haapi.ankama.com/json/Ankama/v2/Api/CreateApiKey'
const CreateToken =
  'https://haapi.ankama.com/json/Ankama/v2/Account/CreateToken?game=18'

export function getApiKey(login: string, password: string, isLongLifeToken: boolean): Promise<any> {
  const payload = `login=${login}&password=${password}&long_life_token=${isLongLifeToken.toString()}`
  return cURL(CreateApiKey, payload)
}

export function getToken(key: string): Promise<any> {
  return getJson(CreateToken, { headers: { apiKey: key } })
}
