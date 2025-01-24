import express, { Application } from "express";
import { IServerConfig } from "../types/ServerConfig.js";
import { IServer } from "../types/Server.js";
import { Server } from "node:http";
import { IMiddleware } from "types/Middleware.js";

export class ExpressServer implements IServer {
  private config: IServerConfig;
  private app: Application;
  private server?: Server;
  constructor(config: IServerConfig) {
    this.config = config;
    this.app = express();
  }
  start(middlewares: IMiddleware[]) {
    middlewares.forEach((middleware) => middleware.attach(this.app));
    
    this.server = this.app.listen(this.config.port, (err: Error | undefined) => {
      console.log(`Express Server listening on ${this.config.port}`);
    });
  }
  stop(): void {
    if (this.server) {
      this.server.close();
    }
  }
}
