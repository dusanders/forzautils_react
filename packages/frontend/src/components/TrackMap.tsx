import React, { useEffect, useReducer, useRef, useState } from "react";
import { Card } from "./Card";
import { Paper } from "./Paper";
import { ThemeText } from './ThemeText';
import { useTheme } from "../context/Theme";
import { CardTitle } from "./CardTitle";
import { useScreenDimensions } from "../hooks/useScreenDimensions";
import { Utils } from "../utility/Utils";
import { useForzaData } from "../context/ForzaContext";
import { FM8_CarInfo } from "@forzautils/core";
import { FM8_trackList } from "ForzaTelemetryApi";
import { StateHandler } from "../utility/types";

export interface TrackMapProps {

}

interface ViewBoxState {
  minY: number;
  minX: number;
  maxX: number;
  maxY: number;
}
interface PlayerPosition {
  x: number;
  y: number;
}
interface RaceInfo {
  currentLap: number;
  currentPosition: number;
  trackId: number;
  time: number;
}
interface TrackMapState {
  svgPath: string;
  positionArray: PlayerPosition[];
  viewBox: ViewBoxState;
  playerPosition: PlayerPosition;
  raceInfo: RaceInfo;
}

const initialState: TrackMapState = {
  svgPath: '',
  positionArray: [],
  viewBox: {
    minX: -10,
    minY: -10,
    maxX: 20,
    maxY: 20
  },
  playerPosition: {
    x: 0,
    y: 0
  },
  raceInfo: {
    currentLap: 0,
    currentPosition: 0,
    trackId: 0,
    time: 0
  }
}

export function TrackMap(props: TrackMapProps) {
  const xPadding: number = 10;
  const yPadding: number = 10;
  const theme = useTheme();
  const screen = useScreenDimensions();
  const forza = useForzaData();

  const [state, setState] = useReducer<StateHandler<TrackMapState>>((state, newState) => {
    if (newState.raceInfo?.trackId && state.raceInfo.trackId !== newState.raceInfo?.trackId) {
      const resetState = initialState;
      resetState.raceInfo = newState.raceInfo;
      return resetState;
    }
    if (newState.playerPosition) {
      newState.positionArray = [...state.positionArray, newState.playerPosition];
      newState.svgPath = newState.positionArray.reduce((svgPath, pos, index) => {
        if (index === 0) {
          return `M${pos.x} ${pos.y}`;
        } else if (index === 1) {
          return `${svgPath} L${pos.x} ${pos.y}`;
        } else {
          return `${svgPath} L${pos.x} ${pos.y}`;
        }
      }, '');
      newState.viewBox = {
        maxX: (Math.max(...newState.positionArray.map((i) => Math.abs(i.x))) + xPadding) * 2,
        maxY: (Math.max(...newState.positionArray.map((i) => Math.abs(i.y))) + yPadding) * 2,
        minX: (Math.min(...newState.positionArray.map((i) => i.x)) - xPadding),
        minY: (Math.min(...newState.positionArray.map((i) => i.y)) - yPadding)
      };
    }
    return { ...state, ...newState }
  }, initialState);

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn) {
      return;
    }
    setState({
      raceInfo: {
        currentLap: forza.packet.data.lapNumber,
        currentPosition: forza.packet.data.racePosition,
        trackId: forza.packet.data.trackId,
        time: forza.packet.data.currentRaceTime
      },
      playerPosition: {
        x: forza.packet.data.position.x / 100,
        y: forza.packet.data.position.z / 100
      }
    })
  }, [forza.packet]);

  const trackInfo = FM8_trackList.getTrackInfo(state.raceInfo.trackId);
  const fontSize = (Math.max(state.viewBox.maxY), Math.abs(state.viewBox.minY)) * 0.1;
  return (
    <div
      className='place-items-center flex flex-col relative'>
      <ThemeText className="mt-[-1rem] uppercase font-bold text-center">
        {trackInfo ? trackInfo.circuit : 'No Track Data'}
      </ThemeText>
      <svg height={Utils.getGraphWidth(screen.dimensions.innerWidth)}
        width={Utils.getGraphWidth(screen.dimensions.innerWidth)}
        className={`${theme.colors.background.trackMap} rounded-lg`}
        preserveAspectRatio="xMidYMid meet"
        viewBox={`${state.viewBox.minX} ${state.viewBox.minY} ${state.viewBox.maxX} ${state.viewBox.maxY}`}>
        <path stroke={theme.colors.charts.line.axisLine}
          strokeWidth={fontSize * 0.3}
          strokeLinecap={'round'} fill="rgba(0,0,0,0)"
          d={state.svgPath} />
        <circle
          cx={state.playerPosition.x}
          cy={state.playerPosition.y}
          r={fontSize * 0.5}
          fill={theme.colors.charts.line.indicator} />
      </svg>
      <div className="flex flex-col h-full w-full absolute">
        <ThemeText className="text-2xl">
          Lap: {state.raceInfo.currentLap + 1}
        </ThemeText>
        <ThemeText className="text-2xl">
          Position: {state.raceInfo.currentPosition}
        </ThemeText>
        <ThemeText className="text-2xl">
          Race Time: {state.raceInfo.time.toFixed(3)}
        </ThemeText>
      </div>
    </div>
  )
}