import { IServerConfig } from './types/ServerConfig';
import { ExpressServer } from './servers/ExpressServer';
import { WebsocketServer } from './servers/WebsocketServer';
import { IServer } from './types/Server';

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