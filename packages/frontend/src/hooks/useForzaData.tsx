import { ForzaDataEvent, ForzaWebsocket } from "@forzautils/core";
import { useEffect, useState } from "react";

export interface IForzaData {
  isWebsocketOpen: boolean;
  packet?: ForzaDataEvent
}

export function useForzaData(): IForzaData {
  const ws = ForzaWebsocket.Open();
  const [isWSOpen, setIsWSOpen] = useState(false);
  const [packet, setPacket] = useState<ForzaDataEvent|undefined>();
  useEffect(() => {
    const openSub = ws.on('open', () => {
      setIsWSOpen(true);
    });
    const closeSub = ws.on('close', () => {
      setIsWSOpen(false);
    })
    const dataSub = ws.on('data', (data) => {
      setPacket(data)
    });
    ws.start();
    return () => {
      dataSub.remove();
      openSub.remove();
      closeSub.remove();
    }
  }, []);
  return {
    packet: packet,
    isWebsocketOpen: isWSOpen
  };
}