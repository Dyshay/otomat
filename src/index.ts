export { default as PluginLoader }  from './plugin-loader'
export { default as Client }  from './client'

export class Settings {
  public language: string = null
  public appVersion: string = null
  public buildVersion: string = null
  public staticDataVersion: string = null
  public assetsVersion: string = null
}

export class Credentials {
  public login: string = null
  public password: string = null
  public sticker: string = null
  public token: string = null
  public clientKey: string = null

  constructor(login: string, password: string) {
    this.login = login
    this.password = password
  }
}