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
    console.log(`measure: 
      ${svgDiv.current?.getBoundingClientRect().height}
      ${svgDiv.current?.getBoundingClientRect().width}
      `);
    const layoutHeight = svgDiv.current?.getBoundingClientRect().height;
    const layoutWidth = svgDiv.current?.getBoundingClientRect().width;
    setSvgHeight(layoutHeight || (layoutWidth || 200));
    setSvgWidth(layoutWidth || 0)
  }, [svgDiv]);

  return (
    <Paper rootClassName='w-5/10'>
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