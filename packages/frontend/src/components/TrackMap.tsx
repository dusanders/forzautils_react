import React, { useEffect, useRef, useState } from "react";
import { Card } from "./Card";
import { Paper } from "./Paper";
import { Text } from './Text';
import { useTheme } from "../context/Theme";
import { CardTitle } from "./CardTitle";
import { useScreenDimensions } from "../hooks/useScreenDimensions";
import { Utils } from "../utility/Utils";

export interface TrackMapProps {

}

export function TrackMap(props: TrackMapProps) {
  const theme = useTheme();
  const screen = useScreenDimensions();

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
              className={`${theme.colors.background.trackMap} rounded-lg`}>

            </svg>
          </div>
        )} />
    </Paper>
  )
}