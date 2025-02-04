import React, { createContext, ReactElement, useContext, useEffect, useRef, useState } from "react";
import { ForzaDataEvent, ForzaWebsocket, PlaybackRequest } from "@forzautils/core";

export interface IForzaData {
  isWebsocketOpen: boolean;
  packet?: ForzaDataEvent;
  replayPacket?: ForzaDataEvent;
  requestPlayback(request: PlaybackRequest): void;
}

export interface ForzaContextProps {
  children: (forza: IForzaData) => ReactElement;
}

const forza_context = createContext({} as IForzaData);

export function ForzaContext(props: ForzaContextProps) {
  const ws = ForzaWebsocket.Open();
  const packetRef = useRef<ForzaDataEvent>();
  const replayPacketRef = useRef<ForzaDataEvent>();
  const [isWSOpen, setIsWSOpen] = useState(false);
  const [packet, setPacket] = useState<ForzaDataEvent | undefined>();
  const [replay, setReplay] = useState<ForzaDataEvent | undefined>();
  useEffect(() => {
    const openSub = ws.on('open', () => {
      ws.setRecordingState(true);
      setIsWSOpen(true);
    });
    const closeSub = ws.on('close', () => {
      setIsWSOpen(false);
    });
    const dataSub = ws.on('data', (data) => {
      packetRef.current = data;
    });
    const replaySub = ws.on('replay', (data) => {
      replayPacketRef.current = data;
    });
    const throttleInterval = setInterval(() => {
      setPacket(packetRef.current);
    }, 100);
    const replayThrottle = setInterval(() => {
      setReplay(replayPacketRef.current);
    }, 100);
    ws.start();
    return () => {
      dataSub.remove();
      openSub.remove();
      closeSub.remove();
      replaySub.remove();
      clearInterval(throttleInterval);
      clearInterval(replayThrottle);
    }
  }, []);
  
  return (
    <forza_context.Provider value={{
      packet: packet,
      replayPacket: replay,
      isWebsocketOpen: isWSOpen,
      requestPlayback: (request) => {
        ws.requestReplay(request);
      }
    }}>
      <forza_context.Consumer>
        {context => props.children(context)}
      </forza_context.Consumer>
    </forza_context.Provider>
  )
}

export function useForzaData() {
  return useContext(forza_context);
}