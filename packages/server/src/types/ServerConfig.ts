export interface IServerConfig {
  port: number;
  wwwRoot: string;
}

export interface IWebsocketServerConfig {
  wsPort: number;
  forzaListenPort: number;
}

export interface IRecordDataConfig {
  parentDir: string;
}

export type AppConfig = IServerConfig & IWebsocketServerConfig & IRecordDataConfig;