import { ServerMessage, SocketTopics } from "@forzautils/core";
import { IFileReader } from "../services/FileReader.js";
import { IWebsocketInfo } from "../types/WebsocketInfo.js";
import { WebSocket } from 'uWebSockets.js';
import { ByteEncoder } from "../utilities/ByteEncoder.js";

export class ReplayWebsocket {
  private ws: WebSocket<IWebsocketInfo>;
  
  constructor(ws: WebSocket<IWebsocketInfo>) {
    this.ws = ws;
  }

  async replay(reader: IFileReader) {
    let packet = await reader.getNextPacket();
    while(packet) {
      const message: ServerMessage = {
        topic: SocketTopics.Playback,
        data: packet
      }
      this.ws.send(ByteEncoder.encode(JSON.stringify(message)));
      packet = await reader.getNextPacket();
    }
  }
}