import { ForzaDataEvent, ForzaWebsocket } from "@forzautils/core";
import { useEffect, useState } from "react";

export interface IForzaData {
  packet?: ForzaDataEvent
}

export function useForzaData() {
  const ws = ForzaWebsocket.Open();
  const [packet, setPacket] = useState<ForzaDataEvent|undefined>();
  useEffect(() => {
    const sub = ws.on('data', (data) => {
      setPacket(data)
    });
    ws.start();
    return () => {
      sub.remove();
    }
  }, []);
  return {
    packet: packet
  };
}