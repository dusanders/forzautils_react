import { HttpRoutes, WifiInfoDto } from "@forzautils/core";
import { Application, NextFunction, Request, Response } from "express";
import { IMiddleware } from "types/Middleware.js";
import * as IP from 'ip';
import { IConfigureUdpSocket } from "types/ForzaUdpTypes.js";

export class WifiInfoMiddleware implements IMiddleware {
  private udpConfig: IConfigureUdpSocket;

  constructor(udpConfig: IConfigureUdpSocket) {
    this.udpConfig = udpConfig;
  }

  attach(app: Application): Application {
    app.get(HttpRoutes.wifiInfo, this.getWifiInfo.bind(this));
    return app;
  }

  private getWifiInfo(req: Request, res: Response, next: NextFunction) {
    const ip = IP.address() ;  
    const dto: WifiInfoDto = {
      ip: ip,
      listenPort: this.udpConfig.currentPort
    }
    res.json(dto);
    res.end();
  } 
}