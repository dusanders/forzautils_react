import { GraphQLInt, GraphQLObjectType, GraphQLResolveInfo, GraphQLSchema, GraphQLString } from "graphql";
import { IMiddleware } from "../types/Middleware.js";
import { Application, Handler } from "express";
import { createHandler } from "graphql-http/lib/use/express";
import ip from "ip";
const { address } = ip;
import { IConfigureUdpSocket } from "../types/ForzaUdpTypes.js";
import { HttpRoutes } from "@forzautils/core";

export class GraphQLMiddleware implements IMiddleware {
  private udpConfig: IConfigureUdpSocket;

  constructor(udpConfig: IConfigureUdpSocket) {
    this.udpConfig = udpConfig;
  }

  attach(app: Application): Application {
    app.use(HttpRoutes.wifiInfoQL, this.resolveWifiInfo());
    return app;
  }

  private resolveWifiInfo(): Handler {
    return createHandler({
      schema: new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            ip: { type: GraphQLString },
            listenPort: { type: GraphQLInt }
          }
        })
      }),
      rootValue: {
        ip: () => {
          return this.getIpAddress();
        },
        listenPort: () => {
          return this.getPort();
        }
      }
    })
  }

  private getPort(): number {
    return this.udpConfig.currentPort;
  }
  private getIpAddress(): string {
    const ip = address('public', 'ipv4');
    return ip;
  }
}