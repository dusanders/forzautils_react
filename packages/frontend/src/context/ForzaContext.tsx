import React, { createContext, ReactElement, useContext, useEffect, useRef, useState } from "react";
import { ForzaDataEvent, ForzaWebsocket } from "@forzautils/core";

export interface IForzaData {
  isWebsocketOpen: boolean;
  packet?: ForzaDataEvent
}

export interface ForzaContextProps {
  children: (forza: IForzaData) => ReactElement;
}

const forza_context = createContext({} as IForzaData);

export function ForzaContext(props: ForzaContextProps) {
  const ws = ForzaWebsocket.Open();
  const packetRef = useRef<ForzaDataEvent>();
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
      packetRef.current = data;
    });
    const throttleInterval = setInterval(() => {
      setPacket(packetRef.current);
    }, 100);
    ws.start();
    return () => {
      dataSub.remove();
      openSub.remove();
      closeSub.remove();
      clearInterval(throttleInterval);
    }
  }, []);
  return (
    <forza_context.Provider value={{
      packet: packet,
      isWebsocketOpen: isWSOpen
    }}>
      <forza_context.Consumer>
        {context => props.children(context)}
      </forza_context.Consumer>
    </forza_context.Provider>
  )
}

export function useForzaData(){
  return useContext(forza_context);
}