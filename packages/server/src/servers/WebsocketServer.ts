import { App, TemplatedApp } from "uWebSockets.js";
import { IServerConfig } from "../types/ServerConfig";
import { IServer } from "../types/Server";
import { WebsocketHub } from "../sockets/WebsocketHub";
import { IForzaDataEmitter } from "../types/ForzaDataEmitter";
import { ByteEncoder } from "../utilities/ByteEncoder";
import { PublicSubscriptions } from "../types/Constants";

export class WebsocketServer implements IServer, IForzaDataEmitter {
  private config: IServerConfig;
  private wsApp: TemplatedApp;
  private hub: WebsocketHub;
  constructor(config: IServerConfig) {
    this.config = config;
    this.wsApp = App();
    this.hub = new WebsocketHub();
  }
  start() {
    this.wsApp.ws('/connect', this.hub.behavior);
    this.wsApp.listen(this.config.wsPort, (socket) => {
      if (!socket) {
        console.error(`Failed to open websocket - closing`);
        process.exit(1)
      }
      console.log(`Websocket server listening on ${this.config.wsPort}`);
    });
  }
  stop() {
    this.wsApp.close();
  }
  sendPacket(bytes: ArrayBuffer): void {
    this.wsApp.publish(
      ByteEncoder.encode(PublicSubscriptions.ForzaData), 
      bytes
    );
  }
}