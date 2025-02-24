import React, { createContext, ReactElement, useContext, useEffect, useReducer, useRef, useState } from "react";
import { ForzaDataEvent, ForzaWebsocket, PlaybackRequest } from "@forzautils/core";
import { LimitedArray } from "../utility/LimitedArray";
import { StateHandler } from "../utility/types";

export interface IForzaData {
  isWebsocketOpen: boolean;
  dataWindow: LimitedArray<ForzaDataEvent>;
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
  const slidingWindow = useRef<LimitedArray<ForzaDataEvent>>(new LimitedArray(10, []));
  const [isWSOpen, setIsWSOpen] = useState(false);
  const [replay, setReplay] = useState<ForzaDataEvent | undefined>();
  const [latestPacket, setLatestPacket] = useReducer<StateHandler<ForzaDataEvent | undefined>>((prev, next) => {
    if(!next?.data || !next.data.isRaceOn) {
      return prev;
    }
    return {
      ...prev,
      ...next
    } as any
  }, undefined);
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
      packetRef.current = data;
    });
    const throttleInterval = setInterval(() => {
      console.log(`Setting latest packet: ${packetRef.current?.data.timeStampMS}`);
      setLatestPacket(packetRef.current);
      if (packetRef.current && packetRef.current.data.isRaceOn) {
        console.log(`Adding packet to data window: ${slidingWindow.current.data.length}`);
        slidingWindow.current = slidingWindow.current.push(packetRef.current);
      }
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
      packet: latestPacket,
      replayPacket: replay,
      isWebsocketOpen: isWSOpen,
      dataWindow: slidingWindow.current,
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