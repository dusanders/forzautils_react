
import { AppConfig } from './types/ServerConfig.js';
import { ExpressServer } from './servers/ExpressServer.js';
import { WebsocketServer } from './servers/WebsocketServer.js';
import { IServer, IWebsocketServer } from './types/Server.js';
import { WifiInfoMiddleware } from './middleware/WifiInfoRest.middleware.js';
import { StaticMiddleware } from './middleware/Static.middleware.js';
import { CorsMiddleware } from './middleware/Cors.middleware.js';
import { GraphQLMiddleware } from './middleware/WifiInfoQL.middleware.js';
import { IncomingUdpListener } from './sockets/IncomingUdpSocket.js';
import { ForzaDataRecorder, IRecordData } from './services/Recorder.js';
import { RecorderQLMiddleware } from './middleware/RecordedQL.middleware.js';
import { RecordedRestMiddleware } from './middleware/RecordedRest.middleware.js';

class Server {

  private expressServer: IServer;
  private websocketServer: IWebsocketServer;
  private forzaUdpListener: IncomingUdpListener;
  private dataRecorder: IRecordData;
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
    this.forzaUdpListener = new IncomingUdpListener();
    this.expressServer = new ExpressServer(this.config);
    this.websocketServer = new WebsocketServer(this.config, this.forzaUdpListener);
    this.dataRecorder = new ForzaDataRecorder(this.config, this.forzaUdpListener);
  }

  async start() {
    await this.dataRecorder.initialize();
    this.expressServer.start([
      new CorsMiddleware(),
      new RecordedRestMiddleware(this.dataRecorder),
      new RecorderQLMiddleware(this.dataRecorder),
      new GraphQLMiddleware(this.forzaUdpListener),
      new WifiInfoMiddleware(this.forzaUdpListener),
      new StaticMiddleware(this.config.wwwRoot)
    ]);
    this.websocketServer.start();
    this.forzaUdpListener.start(this.config.forzaListenPort);
    this.catchProcessExit();
  }

  private catchProcessExit() {
    process.on('exit',this.stopAll.bind(this));
    process.on('SIGINT', this.stopAll.bind(this));
    process.on('SIGUSR1', this.stopAll.bind(this));
    process.on('SIGUSR2', this.stopAll.bind(this));
    process.on('uncaughtException', this.stopAll.bind(this));
    process.on('unhandledRejection', this.stopAll.bind(this));
  }

  private stopAll() {
    console.warn(`PROCESS EXITING.... SHUTDOWN NOW....`);
    this.forzaUdpListener.stop();
    this.websocketServer.stop();
    this.expressServer.stop();
    process.exit(0);
  }
}

// TODO - move config into file and read file
//  here instead of magic strings
const server = new Server({
  port: 80,
  wsPort: 81,
  wwwRoot: '../frontend/dist',
  forzaListenPort: 5200,
  parentDir: './recordings'
});
server.start();