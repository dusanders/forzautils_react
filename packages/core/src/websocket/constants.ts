import { ForzaTelemetryApi } from "ForzaTelemetryApi";

export enum SocketTopics {
  LiveData = 'forza-data',
  Playback = 'replay-data'
}

export interface ServerMessageMap {
  'forza-data': ForzaTelemetryApi;
  'replay-data': ForzaTelemetryApi;
}

export class WebsocketUtils {
  static byteToTopic(byte: number) {
    switch(byte) {
      case 0: return SocketTopics.LiveData;
      case 1: return SocketTopics.Playback;
    }
  }
  static topicToByte(topic: SocketTopics) {
    switch(topic) {
      case SocketTopics.LiveData: return 0;
      case SocketTopics.Playback: return 1;
    }
  }
}