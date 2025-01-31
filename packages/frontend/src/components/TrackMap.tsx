import React, { useEffect, useRef, useState } from "react";
import { Card } from "./Card";
import { Paper } from "./Paper";
import { Text } from './Text';
import { useTheme } from "../context/Theme";
import { CardTitle } from "./CardTitle";
import { useScreenDimensions } from "../hooks/useScreenDimensions";
import { Utils } from "../utility/Utils";
import { useForzaData } from "../context/ForzaContext";

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
}
export function TrackMap(props: TrackMapProps) {
  const xPadding: number = 10;
  const yPadding: number = 10;
  const theme = useTheme();
  const screen = useScreenDimensions();
  const forza = useForzaData();
  const [path, setPath] = useState('');
  const [raceInfo, setRaceInfo] = useState<RaceInfo>({ currentLap: 0, currentPosition: 0 });
  const [positions, setPositions] = useState<PlayerPosition[]>([]);
  const [viewBox, setViewBox] = useState<ViewBoxState>({
    minX: -10,
    minY: -10,
    maxX: 20,
    maxY: 20
  });

  const maybeUpdateViewBox = (newViewBox: ViewBoxState) => {
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
    if (!positions.length) {
      setPath(`M${newPosition.x} ${newPosition.y}`);
    } else {
      setPath(`${path} L${newPosition.x} ${newPosition.y}`);
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
      currentPosition: forza.packet.data.racePosition
    });
  }, [forza.packet]);

  const fontSize = (Math.abs(viewBox.maxY) / Math.abs(viewBox.minY)) * 0.3;
  return (
    <Paper rootClassName='inline-block'
      innerClassName="h-full">
      <Card
        rootClassName="h-full"
        title={(
          <CardTitle title="Track Map" />
        )}
        body={(
          <div
            id="trackmap_root"
            className='w-full h-full place-items-center flex'>
            <svg height={Utils.getGraphWidth(screen.dimensions.innerWidth)}
              width={Utils.getGraphWidth(screen.dimensions.innerWidth)}
              className={`${theme.colors.background.trackMap} rounded-lg`}
              viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.maxX} ${viewBox.maxY}`}>
              <text fontSize={fontSize}
                fill={theme.colors.charts.line.valueLabel}
                x={viewBox.minX} y={viewBox.minY + fontSize}>
                Lap: {raceInfo.currentLap} Pos: {raceInfo.currentPosition}
              </text>
              <path stroke={theme.colors.charts.line.axisLine} strokeWidth={1} d={path} strokeLinecap={'round'} />
            </svg>
          </div>
        )} />
    </Paper>
  )
}