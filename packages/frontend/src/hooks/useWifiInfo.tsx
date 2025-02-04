import { Api, WifiInfoDto } from "@forzautils/core";
import { useEffect, useState } from "react";

export interface WifiInfoHook {
  info?: WifiInfoDto;
}

export function useWifiInfo(): WifiInfoHook {
  const [info, setInfo] = useState<WifiInfoDto|undefined>(undefined);

  useEffect(() => {
    const fetch = async () => {
      const response = await new Api().wifiApi.getIpInfoQL();
      setInfo(response.data);
    }
    fetch();
  }, []);

  return {
    info: info
  }
}