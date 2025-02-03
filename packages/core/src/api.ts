import { IWifiApi, WifiApi } from "./api/wifiApi.js";
import { IRecordedFilesApi, RecordedFilesQL } from "./api/recorded.js";

export interface IApi {
  wifiApi: IWifiApi;
  recorded: IRecordedFilesApi;
}

export class Api implements IApi {
  wifiApi: IWifiApi = new WifiApi();
  recorded: IRecordedFilesApi = new RecordedFilesQL();
}