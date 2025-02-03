import { SocketTopics, WebsocketUtils } from "@forzautils/core";
import { Filename } from "../services/Filename.js";
import { IFileReader } from "../services/FileReader.js";
import { IWebsocketInfo } from "../types/WebsocketInfo.js";
import { WebSocket } from 'uWebSockets.js';

export class ReplayWebsocket {
  private ws: WebSocket<IWebsocketInfo>;
  
  constructor(ws: WebSocket<IWebsocketInfo>) {
    this.ws = ws;
  }
  async replay(filename: string, playback: IFileReader) {
    const parsed = (new Filename()).parseFilename(filename)
    const packetLen = Number.parseInt(parsed.packetLen);
    let packet = await playback.getNextPacket(packetLen);
    while(packet) {
      this.ws.send(Buffer.from([
        WebsocketUtils.topicToByte(SocketTopics.Playback),
        ...packet
      ]));
      packet = await playback.getNextPacket(packetLen);
    }
  }
}