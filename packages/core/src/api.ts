import { WifiInfoDto } from "./dto/wifiInfo.js";
import * as axios from 'axios';
import { HttpRoutes } from "./routes.js";

function usingAxios(): axios.AxiosInstance {
  const api = axios.default.create();
  // Nothing to configure yet
  return api;
}
function usingAuthAxios(jwt: string): axios.AxiosInstance {
  const api = axios.default.create();
  api.defaults.headers.common.Authorization = `Bearer ${jwt}`;
  return api;
}

export interface ApiResponse<T> {
  data: T;
  error?: {
    status: number;
    responseBody: any;
  }
}
export interface IWifiApi {
  getIpInfo(): Promise<ApiResponse<WifiInfoDto>>;
}

export interface IApi {
  wifiApi: IWifiApi;
}

export class Api implements IApi {
  wifiApi: IWifiApi = new WifiApi();
}

class WifiApi implements IWifiApi {
  async getIpInfo(): Promise<ApiResponse<WifiInfoDto>> {
    const api = usingAxios();
    const response = await api.get(`${HttpRoutes.baseUrl}${HttpRoutes.wifiInfo}`);
    if(response.status !== 200) {
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