import { Application, json } from "express";
import { IMiddleware } from "../types/Middleware.js";
import { HttpRoutes, RecordedFilesQuery } from "@forzautils/core";
import { IRecordData } from "../services/Recorder.js";

export class RecordedRestMiddleware implements IMiddleware {
  private recorder: IRecordData;

  constructor(recorder: IRecordData) {
    this.recorder = recorder;
  }

  attach(app: Application): Application {
    app.post(HttpRoutes.recordedFilesRest,
      json(),
      async (req, res, next) => {
        const result = await this.getPreviousRuns(req.body);
        res.json(result);
        res.end();
      }
    )
    return app;
  }

  private async getPreviousRuns(req: RecordedFilesQuery) {
    const all = await this.recorder.getAllRecordings();
    return all;
  }
}