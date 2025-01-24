import { Application } from "express";
import * as cors from 'cors';
import { IMiddleware } from "../types/Middleware.js";

export class CorsMiddleware implements IMiddleware {
  attach(app: Application): Application {
    app.use(cors.default());
    return app;
  }
}