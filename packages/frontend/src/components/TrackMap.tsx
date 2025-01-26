import React, { useEffect, useRef, useState } from "react";
import { Card } from "./Card";
import { Paper } from "./Paper";
import { Text } from './Text';
import { useTheme } from "../context/Theme";

export interface TrackMapProps {

}

export function TrackMap(props: TrackMapProps) {
  const theme = useTheme();
  const svgDiv = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);
  const [svgWidth, setSvgWidth] = useState(0);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log(`measure: 
      ${width}
      ${height}
      `);
    const boxLayout = width * 0.4;
    setSvgHeight(boxLayout);
    setSvgWidth(boxLayout)
  }, [svgDiv]);

  return (
    <Paper rootClassName='inline-block'>
      <Card
        title={(
          <Text element='h2' className='font-bold uppercase opacity-60'>
            Track Map
          </Text>
        )}
        body={(
          <div ref={svgDiv} id="trackmap_root" className='w-full'>
            <svg height={svgHeight}
              width={svgWidth}
              className={`${theme.colors.background.trackMap} rounded-lg`}>

            </svg>
          </div>
        )} />
    </Paper>
  )
}