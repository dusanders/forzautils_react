import { App, TemplatedApp, WebSocket } from "uWebSockets.js";
import { IWebsocketServerConfig } from "../types/ServerConfig.js";
import { IWebsocketServer } from "../types/Server.js";
import { WebsocketHub } from "../sockets/WebsocketHub.js";
import { ISubscribeUdpEvents, UdpEventSubscription } from "../types/ForzaUdpTypes.js";
import { WebsocketRoutes, SocketTopics, WebsocketRequestValidator, ServerMessage } from "@forzautils/core"
import { IWebsocketInfo } from "../types/WebsocketInfo.js";
import { ByteEncoder } from "../utilities/ByteEncoder.js";
import { ReplayWebsocket } from "../sockets/ReplaySocket.js";
import { IRecordData } from "../services/Recorder.js";

export class WebsocketServer implements IWebsocketServer {
  private config: IWebsocketServerConfig;
  private wsApp: TemplatedApp;
  private hub: WebsocketHub;
  private forzaUdp: ISubscribeUdpEvents;
  private forzaSubscription?: UdpEventSubscription;
  private recorder: IRecordData;

  constructor(config: IWebsocketServerConfig,
    updSocket: ISubscribeUdpEvents,
    recorder: IRecordData) {
    this.config = config;
    this.wsApp = App();
    this.hub = new WebsocketHub({
      onIncomingMessage: this.handleIncomingMessage.bind(this)
    });
    this.forzaUdp = updSocket;
    this.recorder = recorder;
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

  private async handleIncomingMessage(socket: WebSocket<IWebsocketInfo>, data: ArrayBuffer) {
    const request = JSON.parse(ByteEncoder.decode(data));
    if (WebsocketRequestValidator.isPlaybackRequest(request)) {
      console.log(`Received playback request for ${request.filename}`);
      const replaySocket = new ReplayWebsocket(socket);
      replaySocket.replay(await this.recorder.playback(request.filename));
    } else if(WebsocketRequestValidator.isSetRecordingRequest(request)) {
      this.recorder.setRecording(request.record);
    }
    else {
      console.log(`Unknown request message: ${ByteEncoder.decode(data)}`);
    }
  }

  private setupFozaUdp() {
    this.forzaSubscription = this.forzaUdp.on('packet', (data) => {
      this.sendPacket(data);
    });
  }

  private sendPacket(bytes: Buffer<ArrayBufferLike>): void {
    const message: ServerMessage = {
      topic: SocketTopics.LiveData,
      data: new Uint8Array(bytes)
    };
    this.recorder.maybeWritePacket(bytes);
    this.wsApp.publish(
      SocketTopics.LiveData,
      ByteEncoder.encode(JSON.stringify(message, (key, value) => {
        if(value instanceof Uint8Array) {
          return {type: 'Uint8Array', data: Array.from(value)};
        }
        return value;
      })),
      true
    );
  }
}