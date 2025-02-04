import { Application, Handler } from "express";
import { IMiddleware } from "../types/Middleware.js";
import { HttpRoutes, RecordedFilesQuery } from "@forzautils/core";
import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { IRecordData } from "../services/Recorder.js";

const recordedFile_schema = new GraphQLObjectType({
  name: 'RecordedFile',
  fields: {
    filename: { type: GraphQLString },
    date: { type: GraphQLFloat },
    packetLen: { type: GraphQLInt },
    trackId: { type: GraphQLInt }
  }
});

export class RecorderQLMiddleware implements IMiddleware {
  private recorder: IRecordData;

  constructor(recorder: IRecordData) {
    this.recorder = recorder;
  }

  attach(app: Application): Application {
    app.use(HttpRoutes.recordedFilesQL, this.resolve());
    return app;
  }

  private resolve(): Handler {
    return createHandler({
      schema: new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            previousRuns: {
              type: new GraphQLList(recordedFile_schema),
              args: {
                rangeStart: { type: GraphQLInt },
                rangeEnd: { type: GraphQLInt }
              }
            }
          }
        })
      }),
      rootValue: {
        previousRuns: (args: RecordedFilesQuery) => {
          return this.getAllFiles();
        }
      }
    })
  }

  private async getAllFiles() {
    const all = await this.recorder.getAllRecordings();
    all.push({
      trackId: 0,
      date: Date.now(),
      packetLen: 331,
      filename: 'name'
    })
    return all;
  }
}