import React, { useEffect, useRef, useState } from "react";
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
export function TrackMap(props: TrackMapProps) {
  const xPadding: number = 10;
  const yPadding: number = 10;
  const theme = useTheme();
  const screen = useScreenDimensions();
  const forza = useForzaData();
  const [path, setPath] = useState('');
  const [raceInfo, setRaceInfo] = useState<RaceInfo>({ currentLap: 0, currentPosition: 0, trackId: 111, time: 0 });
  const [positions, setPositions] = useState<PlayerPosition[]>([{ x: 0, y: 0 }]);
  const [viewBox, setViewBox] = useState<ViewBoxState>({
    minX: -10,
    minY: -10,
    maxX: 20,
    maxY: 20
  });

  const maybeUpdateViewBox = (newViewBox: ViewBoxState) => {
    if (newViewBox.maxX < 0) {
      newViewBox.maxX = (Math.abs(newViewBox.maxX) - Math.abs(newViewBox.minX)) * 2.3;
    }
    if (newViewBox.maxY < 0) {
      newViewBox.maxY = (Math.abs(newViewBox.maxY) - Math.abs(newViewBox.minY)) * 2.3;
    }
    newViewBox.maxX = Math.abs(newViewBox.minX) * 2.01;
    newViewBox.maxY = Math.abs(newViewBox.minY) * 2.2;
    if (newViewBox.maxX !== viewBox.maxX || newViewBox.maxY !== viewBox.maxY
      || newViewBox.minX !== viewBox.minX || newViewBox.minY !== viewBox.minY) {
      return newViewBox;
    }
    return viewBox;
  }

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn) {
      return;
    }
    const newPosition: PlayerPosition = {
      x: forza.packet.data.position.x,
      y: forza.packet.data.position.z
    };
    if (positions.length === 1 && positions[0].x === 0 && positions[0].y === 0) {
      setPath(`M${newPosition.x} ${newPosition.y}`);
      positions[0] = newPosition;
    } else {
      setPath(`${path} ${positions.length < 2 ? 'L' : ''}${newPosition.x} ${newPosition.y}`);
    }
    const updatedHistory = [...positions, newPosition];
    const xPosHistory = updatedHistory.map((i) => i.x);
    const yPosHistory = updatedHistory.map((i) => i.y);
    setViewBox(
      maybeUpdateViewBox({
        maxX: (Math.max(...xPosHistory) + xPadding),
        maxY: (Math.max(...yPosHistory) + yPadding),
        minX: (Math.min(...xPosHistory) - xPadding),
        minY: (Math.min(...yPosHistory) - yPadding)
      })
    );
    setPositions(updatedHistory);
    setRaceInfo({
      currentLap: forza.packet.data.lapNumber,
      currentPosition: forza.packet.data.racePosition,
      trackId: forza.packet.data.trackId,
      time: forza.packet.data.currentRaceTime
    });
  }, [forza.packet]);

  const trackInfo = FM8_trackList.getTrackInfo(raceInfo.trackId);
  const fontSize = (Math.max(viewBox.maxY), Math.abs(viewBox.minY)) * 0.1;
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
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.maxX} ${viewBox.maxY}`}>
        <path stroke={theme.colors.charts.line.axisLine}
          strokeWidth={fontSize * 0.3}
          strokeLinecap={'round'} fill="rgba(0,0,0,0)"
          d={path} />
        <circle
          cx={positions[positions.length - 1].x}
          cy={positions[positions.length - 1].y}
          r={fontSize * 0.5}
          fill={theme.colors.charts.line.indicator} />
      </svg>
      <div className="flex flex-col h-full w-full absolute">
        <ThemeText className="text-2xl">
          Lap: {raceInfo.currentLap}
        </ThemeText>
        <ThemeText className="text-2xl">
          Position: {raceInfo.currentPosition}
        </ThemeText>
        <ThemeText className="text-2xl">
          Race Time: {raceInfo.time.toFixed(3)}
        </ThemeText>
      </div>
    </div>
  )
}