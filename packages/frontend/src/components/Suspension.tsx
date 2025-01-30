import React from "react";
import { Paper } from "./Paper";
import { Card } from "./Card";
import { CardTitle } from "./CardTitle";
import { LineChart, LineSeriesType, SparkLineChart } from "@mui/x-charts";
import { Utils } from "../utility/Utils";
import { useTheme } from "../context/Theme";
import { useScreenDimensions } from "../hooks/useScreenDimensions";

interface SuspensionGraphProps {
  setA: number[];
  setB: number[];
  labelA: string;
  labelB: string;
}
function SuspensionGraph(props: SuspensionGraphProps) {
  const theme = useTheme();
  const size = useScreenDimensions();
  const seriesA: LineSeriesType = {
    type: 'line',
    data: props.setA,
    label: props.labelA,
    id: Utils.randomKey(),
  };
  const seriesB: LineSeriesType = {
    type: 'line',
    data: props.setB,
    label: props.labelB,
    id: Utils.randomKey(),
  }
  return (
    <LineChart
      className="m-2"
      height={300}
      width={size.dimensions.innerWidth * 0.5}
      series={[
        seriesA,
        seriesB
      ]}
      sx={{
        backgroundColor: theme.colors.charts.line.background,
        borderRadius: 2,
        '& .MuiChartsAxis-bottom': {
          display: 'none'
        },
        '& .MuiChartsLegend-root': {
          '& .MuiChartsLegend-series': {
            'text': {
              fill: `${theme.colors.charts.line.valueLabel} !important`
            }
          }
        },
        '& .MuiChartsAxis-root': {
          '& .MuiChartsAxis-line': {
            stroke: theme.colors.charts.line.axisLine
          },
          '& .MuiChartsAxis-tickContainer': {
            '& .MuiChartsAxis-tickLabel': {
              fill: theme.colors.charts.line.valueLabel
            },
            '& .MuiChartsAxis-tick': {
              stroke: theme.colors.charts.line.tick
            },
          }
        }
      }} />
  )
}

export interface SuspensionProps {

}

export function Suspension(props: SuspensionProps) {
  const lfData = [0, 3, 2, 4, 1, 0];
  const rfData = [0.5, 1.4, 3, 5, 2];
  const lrData = [3, 2, 1.2, 3, 4.2];
  const rrData = [2, 1.2, 3, 2, 5];

  return (
    <Paper>
      <Card
        title={(<CardTitle title="Suspension" />)}
        body={(
          <>
            <SuspensionGraph
              setA={lfData}
              labelA="Left Front"
              setB={rfData}
              labelB="Right Front" />
            <SuspensionGraph
              setA={lrData}
              labelA="Left Rear"
              setB={rrData}
              labelB="Right Rear" />
          </>
        )} />
    </Paper>
  )
}