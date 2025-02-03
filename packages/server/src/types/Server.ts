import { IConfigureUdpSocket } from "./ForzaUdpTypes.js";
import { IMiddleware } from "./Middleware.js";

export interface IServer {
  start(middlewares: IMiddleware[]): void;
  stop(): void;
}

export interface IWebsocketServer {
  start(): void;
  stop(): void;
}