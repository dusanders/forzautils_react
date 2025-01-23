import { IServerConfig } from './types/ServerConfig.js';
import { ExpressServer } from './servers/ExpressServer.js';
import { WebsocketServer } from './servers/WebsocketServer.js';
import { IServer } from './types/Server.js';

class Server {

  private expressServer: IServer;
  private websocketServer: IServer;
  private config: IServerConfig;

  constructor(config: IServerConfig) {
    this.config = config;
    this.expressServer = new ExpressServer(this.config);
    this.websocketServer = new WebsocketServer(this.config);
  }

  start() {
    this.expressServer.start();
    this.websocketServer.start();
  }
}

// TODO - move config into file and read file
//  here instead of magic strings
const server = new Server({
  port: 80,
  wsPort: 81,
  wwwRoot: '../frontend/dist',
  forzaListeningPort: 5200
});
server.start();