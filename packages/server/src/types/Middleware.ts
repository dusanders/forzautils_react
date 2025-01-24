import { Application } from "express";

export interface IMiddleware {
  attach(app: Application): Application;
}