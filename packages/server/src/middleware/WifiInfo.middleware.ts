import { HttpRoutes, WifiInfoDto } from "@forzautils/core";
import { Application, NextFunction, Request, Response } from "express";
import ip from 'ip';
import { IConfigureUdpSocket } from "../types/ForzaUdpTypes.js";
import { IMiddleware } from "../types/Middleware.js";
const { address } = ip;

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
    const ip = address('public', 'ipv4');
    const dto: WifiInfoDto = {
      ip: ip,
      listenPort: this.udpConfig.currentPort
    }
    res.json(dto);
    res.end();
  }
}