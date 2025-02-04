import { SocketTopics } from "./constants.js";

export interface ServerMessage {
  topic: SocketTopics;
  data: any;
}