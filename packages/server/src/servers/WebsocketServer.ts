import { App, TemplatedApp } from "uWebSockets.js";
import { IWebsocketServerConfig } from "../types/ServerConfig.js";
import { IWebsocketServer } from "../types/Server.js";
import { WebsocketHub } from "../sockets/WebsocketHub.js";
import { IConfigureUdpSocket, UdpEventSubscription } from "../types/ForzaUdpTypes.js";
import { ByteEncoder } from "../utilities/ByteEncoder.js";
import { PublicSubscriptions } from "../types/Constants.js";
import { IncomingUdpListener } from "../sockets/IncomingUdpSocket.js";
import { WebsocketRoutes } from "@forzautils/core"

export class WebsocketServer implements IWebsocketServer {
  private config: IWebsocketServerConfig;
  private wsApp: TemplatedApp;
  private hub: WebsocketHub;
  private forzaUdp: IncomingUdpListener;
  private forzaSubscription?: UdpEventSubscription;
  private udpConfig: IConfigureUdpSocket = {
    currentPort: 0
  }

  constructor(config: IWebsocketServerConfig) {
    this.config = config;
    this.wsApp = App();
    this.hub = new WebsocketHub();
    this.forzaUdp = new IncomingUdpListener();
    this.udpConfig.currentPort = config.forzaListenPort;
  }

  getForzaUdpSocketConfig(): IConfigureUdpSocket {
    return this.udpConfig
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
    this.forzaUdp.stop();
    if(this.forzaSubscription) {
      this.forzaSubscription.remove();
    }
  }

  private setupFozaUdp() {
    this.forzaSubscription = this.forzaUdp.on('packet', (data) => {
      this.sendPacket(data);
    })
    this.forzaUdp.start(this.config.forzaListenPort);
  }

  private sendPacket(bytes: Buffer<ArrayBufferLike>): void {
    this.wsApp.publish(
      PublicSubscriptions.ForzaData,
      bytes,
      true
    );
  }
}