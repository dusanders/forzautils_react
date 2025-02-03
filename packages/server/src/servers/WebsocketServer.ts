import { App, TemplatedApp } from "uWebSockets.js";
import { IWebsocketServerConfig } from "../types/ServerConfig.js";
import { IWebsocketServer } from "../types/Server.js";
import { WebsocketHub } from "../sockets/WebsocketHub.js";
import { ISubscribeUdpEvents, UdpEventSubscription } from "../types/ForzaUdpTypes.js";
import { PublicSubscriptions } from "../types/Constants.js";
import { WebsocketRoutes } from "@forzautils/core"

export class WebsocketServer implements IWebsocketServer {
  private config: IWebsocketServerConfig;
  private wsApp: TemplatedApp;
  private hub: WebsocketHub;
  private forzaUdp: ISubscribeUdpEvents;
  private forzaSubscription?: UdpEventSubscription;

  constructor(config: IWebsocketServerConfig, updSocket: ISubscribeUdpEvents) {
    this.config = config;
    this.wsApp = App();
    this.hub = new WebsocketHub();
    this.forzaUdp = updSocket;
  }

  start() {
    this.wsApp.ws(WebsocketRoutes.connect, this.hub.behavior);
    this.wsApp.listen(this.config.wsPort, (socket) => {
      if (!socket) {
        console.error(`Failed to open websocket - closing`);
        process.exit(1)
      }
      console.log(`Websocket server listening on ${this.config.wsPort}`);
      this.setupFozaUdp();
    });
  }

  stop() {
    this.wsApp.close();
    if(this.forzaSubscription) {
      this.forzaSubscription.remove();
    }
  }

  private setupFozaUdp() {
    this.forzaSubscription = this.forzaUdp.on('packet', (data) => {
      this.sendPacket(data);
    });
  }

  private sendPacket(bytes: Buffer<ArrayBufferLike>): void {
    this.wsApp.publish(
      PublicSubscriptions.ForzaData,
      bytes,
      true
    );
  }
}