import { RecordedFile, RecordedFilesQuery } from "../dto/fileInfo.js";
import { HttpRoutes } from "../routes.js";
import { usingAxios } from "./axios.js";
import { ApiResponse } from "./response.js";

export interface IRecordedFilesApi {
  getAllPreviousRuns(query: RecordedFilesQuery): Promise<ApiResponse<RecordedFile[]>>;
  getAllPreviousRest(): Promise<ApiResponse<RecordedFile[]>>;
}

function buildQuery(params: RecordedFilesQuery) {
  return JSON.stringify({
    query: `query PreviousRuns($rangeStart: Int, $rangeEnd: Int){
      previousRuns(rangeStart: $rangeStart, rangeEnd: $rangeEnd) {
        filename,
        date,
        packetLen,
        trackId
      }
    }`,
    variables: {
      rangeStart: params.rangeStart, rangeEnd: params.rangeEnd
    }
  })
}

export class RecordedFilesQL implements IRecordedFilesApi {

  async getAllPreviousRuns(): Promise<ApiResponse<RecordedFile[]>> {
    const api = usingAxios();
    const response = await api.post(
      `${HttpRoutes.baseUrl}${HttpRoutes.recordedFilesQL}`,
      buildQuery({ rangeEnd: 0, rangeStart: 0 })
    )
    return {
      data: response.data.data.previousRuns
    }
  }

  async getAllPreviousRest(): Promise<ApiResponse<RecordedFile[]>> {
    const api = usingAxios();
    const model: RecordedFilesQuery = {
      rangeStart: 0,
      rangeEnd: 0
    }
    const response = await api.post(
      `${HttpRoutes.baseUrl}${HttpRoutes.recordedFilesRest}`,
      model
    )
    return {
      data: response.data
    };
  }
}