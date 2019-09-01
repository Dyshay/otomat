import Socket from '../libs/socket'

declare namespace Plugins {
  interface IPlugin {
    describe: () => {
      name: string
      description: string
    }
    data: any
    subscribers: { [packetName: string]: (ctx: IContext, packet: any) => void }
    methods: { [methodName: string]: () => void | Promise<void> }
    mounted: () => void | Promise<void>
    unmounted: () => void | Promise<void>
  }

  interface IContext {
    socket: Socket
    rootData: any
  }
}
