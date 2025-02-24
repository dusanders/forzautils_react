import { ServerMessage, SocketTopics } from "@forzautils/core";
import { IFileReader } from "../services/FileReader.js";
import { IWebsocketInfo } from "../types/WebsocketInfo.js";
import { WebSocket } from 'uWebSockets.js';
import { ByteEncoder } from "../utilities/ByteEncoder.js";
import { Timers } from "../utilities/Timers.js";

export class ReplayWebsocket {
  private ws: WebSocket<IWebsocketInfo>;

  constructor(ws: WebSocket<IWebsocketInfo>) {
    this.ws = ws;
  }

  async replay(reader: IFileReader) {
    let bytes = await reader.getNextPacket();
    while (bytes) {
      const message: ServerMessage = {
        topic: SocketTopics.Playback,
        data: new Uint8Array(bytes),
      }
      try {
        this.ws.send(
          ByteEncoder.encode(
            ByteEncoder.encodeBinaryMessage(message)
          ),
          true
        );
      } catch (error: Error | unknown) {
        console.warn(`Error sending REPLAY packet: ${error}`);
        break;
      }
      bytes = await reader.getNextPacket();
      await Timers.delay(1000 / 60); // 60 FPS
    }
  }
}