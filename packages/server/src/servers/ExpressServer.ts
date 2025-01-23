import express, { Application } from "express";
import { IServerConfig } from "../types/ServerConfig.js";
import { IServer } from "../types/Server.js";
import { Server } from "node:http";

export class ExpressServer implements IServer {
  private config: IServerConfig;
  private app: Application;
  private server?: Server;
  constructor(config: IServerConfig) {
    this.config = config;
    this.app = express();
  }
  start() {
    this.app.all('/*', express.static(this.config.wwwRoot));
    this.server = this.app.listen(this.config.port, (err: Error | undefined) => {
      console.log(`Express Server listening on ${this.config.port}`);
    });
  }
  stop(): void {
    if(this.server) {
      this.server.close();
    }
  }
}
