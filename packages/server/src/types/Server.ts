import { IConfigureUdpSocket } from "./ForzaUdpTypes.js";
import { IMiddleware } from "./Middleware.js";

export interface IServer {
  start(middlewares: IMiddleware[]): void;
  stop(): void;
}

export interface IWebsocketServer {
  getForzaUdpSocketConfig(): IConfigureUdpSocket;
  start(): void;
  stop(): void;
}