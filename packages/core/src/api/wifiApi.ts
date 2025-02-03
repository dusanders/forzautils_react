import { WifiInfoDto } from "../dto/wifiInfo.js";
import { HttpRoutes } from "../routes.js";
import { usingAxios } from "./axios.js";
import * as axios from 'axios';
import { ApiResponse } from "./response.js";

export interface IWifiApi {
  getIpInfoQL(): Promise<ApiResponse<WifiInfoDto>>;
  getIpInfo(): Promise<ApiResponse<WifiInfoDto>>;
}

function buildWifiQuery(keys: (keyof WifiInfoDto)[]) {
  return JSON.stringify({
    "query": `{${keys.map((key) => key)}}`
  })
}
export class WifiApi implements IWifiApi {
  async getIpInfoQL(): Promise<ApiResponse<WifiInfoDto>> {
    const api = usingAxios();
    const response = await api.post(
      `${HttpRoutes.baseUrl}${HttpRoutes.wifiInfoQL}`,
      buildWifiQuery(['ip', 'listenPort'])
    );
    return {
      data: response.data.data as WifiInfoDto
    }
  }
  async getIpInfo(): Promise<ApiResponse<WifiInfoDto>> {
    const api = usingAxios();
    const response = await api.get(
      `${HttpRoutes.baseUrl}${HttpRoutes.wifiInfoRest}`
    );
    if (response.status !== 200) {
      return this.returnErrorResponse(response);
    }
    const info = response.data as WifiInfoDto;
    return {
      data: info
    };
  }

  private returnErrorResponse<T>(res: axios.AxiosResponse): ApiResponse<T> {
    return {
      data: {} as any,
      error: {
        status: res.status,
        responseBody: res.data
      }
    }
  }
}