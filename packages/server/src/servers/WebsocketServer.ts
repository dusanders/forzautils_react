import { App, TemplatedApp } from "uWebSockets.js";
import { IServerConfig } from "../types/ServerConfig.js";
import { IServer } from "../types/Server.js";
import { WebsocketHub } from "../sockets/WebsocketHub.js";
import { UdpEventSubscription } from "../types/ForzaDataEmitter.js";
import { ByteEncoder } from "../utilities/ByteEncoder.js";
import { PublicSubscriptions } from "../types/Constants.js";
import { IncomingUdpListener } from "../sockets/IncomingUdpSocket.js";
import { WebsocketRoutes } from "@forzautils/core"

export class WebsocketServer implements IServer {
  private config: IServerConfig;
  private wsApp: TemplatedApp;
  private hub: WebsocketHub;
  private forzaUdp: IncomingUdpListener;
  private forzaSubscription?: UdpEventSubscription;

  constructor(config: IServerConfig) {
    this.config = config;
    this.wsApp = App();
    this.hub = new WebsocketHub();
    this.forzaUdp = new IncomingUdpListener();
  }

  start() {
    this.wsApp.ws(WebsocketRoutes.connect, this.hub.behavior);
    this.wsApp.listen(this.config.wsPort, (socket) => {
      if (!socket) {
        console.error(`Failed to open websocket - closing`);
        process.exit(1)
      }
      console.log(`Websocket server listening on ${this.config.wsPort}`);
      this.forzaSubscription = this.forzaUdp.on(
        'packet',
        this.handleForzaData.bind(this)
      );
      this.forzaUdp.start(this.config.forzaListeningPort);
    });
  }

  stop() {
    this.wsApp.close();
    this.forzaUdp.stop();
    if(this.forzaSubscription) {
      this.forzaSubscription.remove();
    }
  }

  private sendPacket(bytes: Buffer<ArrayBufferLike>): void {
    this.wsApp.publish(
      ByteEncoder.encode(PublicSubscriptions.ForzaData),
      bytes,
      true
    );
  }
  
  private handleForzaData(buffer: Buffer<ArrayBufferLike>) {
    this.sendPacket(buffer);
  }
}