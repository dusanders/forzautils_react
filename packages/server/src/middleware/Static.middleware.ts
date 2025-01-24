import express, { Application } from "express";
import { IMiddleware } from "types/Middleware.js";

export class StaticMiddleware implements IMiddleware {
  private wwwroot: string;
  constructor(wwwroot: string) {
    this.wwwroot = wwwroot;
  }
  attach(app: Application): Application {
    app.all('/*', express.static(this.wwwroot));
    return app;
  }
}