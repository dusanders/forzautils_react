import { App, TemplatedApp, WebSocket } from "uWebSockets.js";
import { IWebsocketServerConfig } from "../types/ServerConfig.js";
import { IWebsocketServer } from "../types/Server.js";
import { WebsocketHub } from "../sockets/WebsocketHub.js";
import { ISubscribeUdpEvents, UdpEventSubscription } from "../types/ForzaUdpTypes.js";
import { WebsocketRoutes, SocketTopics, WebsocketUtils } from "@forzautils/core"
import { IWebsocketInfo } from "../types/WebsocketInfo.js";
import { ByteEncoder } from "../utilities/ByteEncoder.js";

export class WebsocketServer implements IWebsocketServer {
  private config: IWebsocketServerConfig;
  private wsApp: TemplatedApp;
  private hub: WebsocketHub;
  private forzaUdp: ISubscribeUdpEvents;
  private forzaSubscription?: UdpEventSubscription;

  constructor(config: IWebsocketServerConfig, updSocket: ISubscribeUdpEvents) {
    this.config = config;
    this.wsApp = App();
    this.hub = new WebsocketHub({
      onIncomingMessage: this.handleIncomingMessage.bind(this)
    });
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
    if (this.forzaSubscription) {
      this.forzaSubscription.remove();
    }
  }

  private handleIncomingMessage(socket: WebSocket<IWebsocketInfo>, data: ArrayBuffer) {
      console.log(`${JSON.stringify(socket.getUserData())} - ${ByteEncoder.decode(data)}`);
  }

  private setupFozaUdp() {
    this.forzaSubscription = this.forzaUdp.on('packet', (data) => {
      this.sendPacket(data);
    });
  }

  private sendPacket(bytes: Buffer<ArrayBufferLike>): void {
    const buffer = Buffer.from([
      WebsocketUtils.topicToByte(SocketTopics.LiveData),
      ...bytes
    ]);
    this.wsApp.publish(
      SocketTopics.LiveData,
      buffer,
      true
    );
  }
}