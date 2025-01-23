import { App, TemplatedApp } from "uWebSockets.js";
import { IServerConfig } from "../types/ServerConfig";
import { IServer } from "../types/Server";
import { WebsocketHub } from "../sockets/WebsocketHub";
import { ForzaEventSubscription, IForzaDataEmitter } from "../types/ForzaDataEmitter";
import { ByteEncoder } from "../utilities/ByteEncoder";
import { PublicSubscriptions } from "../types/Constants";
import { WebsocketRoutes } from "@forzautils_react/core/dist/core/src/routes.js";
import { ForzaUdpListener } from "./ForzaUdpListener";

export class WebsocketServer implements IServer {
  private config: IServerConfig;
  private wsApp: TemplatedApp;
  private hub: WebsocketHub;
  private forzaUdp: ForzaUdpListener;
  private forzaSubscription?: ForzaEventSubscription;
  constructor(config: IServerConfig) {
    this.config = config;
    this.wsApp = App();
    this.hub = new WebsocketHub();
    this.forzaUdp = new ForzaUdpListener();
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
  private sendPacket(bytes: ArrayBuffer): void {
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