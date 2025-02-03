
import * as axios from 'axios';

export function usingAxios(): axios.AxiosInstance {
  const api = axios.default.create({
    headers: {
      'Content-Type': "application/json"
    }
  });

  // Nothing to configure yet
  return api;
}

export function usingAuthAxios(jwt: string): axios.AxiosInstance {
  const api = axios.default.create();
  api.defaults.headers.common.Authorization = `Bearer ${jwt}`;
  return api;
}
