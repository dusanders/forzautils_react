
import { AppConfig } from './types/ServerConfig.js';
import { ExpressServer } from './servers/ExpressServer.js';
import { WebsocketServer } from './servers/WebsocketServer.js';
import { IServer, IWebsocketServer } from './types/Server.js';
import { WifiInfoMiddleware } from './middleware/WifiInfoRest.middleware.js';
import { IConfigureUdpSocket } from './types/ForzaUdpTypes.js';
import { StaticMiddleware } from './middleware/Static.middleware.js';
import { CorsMiddleware } from './middleware/Cors.middleware.js';
import { GraphQLMiddleware } from './middleware/WifiInfoQL.middleware.js';

class Server {

  private expressServer: IServer;
  private websocketServer: IWebsocketServer;
  private udpConfigurator: IConfigureUdpSocket;
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
    this.expressServer = new ExpressServer(this.config);
    this.websocketServer = new WebsocketServer(this.config);
    this.udpConfigurator = this.websocketServer.getForzaUdpSocketConfig()
  }

  start() {
    this.expressServer.start([
      new CorsMiddleware(),
      new GraphQLMiddleware(this.udpConfigurator),
      new WifiInfoMiddleware(this.udpConfigurator),
      new StaticMiddleware(this.config.wwwRoot)
    ]);
    this.websocketServer.start();
  }
}

// TODO - move config into file and read file
//  here instead of magic strings
const server = new Server({
  port: 80,
  wsPort: 81,
  wwwRoot: '../frontend/dist',
  forzaListenPort: 5200
});
server.start();