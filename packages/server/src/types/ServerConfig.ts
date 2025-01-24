export interface IServerConfig {
  port: number;
  wwwRoot: string;
}

export interface IWebsocketServerConfig {
  wsPort: number;
  forzaListenPort: number;
}

export type AppConfig = IServerConfig & IWebsocketServerConfig;