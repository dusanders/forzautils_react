import React, { useEffect, useState } from "react";
import { Paper } from "./Paper";
import { Card } from "./Card";
import { CardTitle } from "./CardTitle";
import { LineChart, LineSeriesType, SparkLineChart } from "@mui/x-charts";
import { Utils } from "../utility/Utils";
import { useTheme } from "../context/Theme";
import { useScreenDimensions } from "../hooks/useScreenDimensions";
import { useForzaData } from "../hooks/useForzaData";
import { LimitedArray } from "../utility/LimitedArray";

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

interface SuspensionState {
  leftFront: LimitedArray<number>;
  rightFront: LimitedArray<number>;
  leftRear: LimitedArray<number>;
  rightRear: LimitedArray<number>;
}
const initialState: SuspensionState = {
  leftFront: new LimitedArray(100, [0, 3, 2, 4, 1, 0]),
  rightFront: new LimitedArray(100, [0.5, 1.4, 3, 5, 2]),
  leftRear: new LimitedArray(100, [3, 2, 1.2, 3, 4.2]),
  rightRear: new LimitedArray(100, [2, 1.2, 3, 2, 5])
}
export function Suspension(props: SuspensionProps) {
  const forza = useForzaData();
  const [state, setState] = useState<SuspensionState>(initialState);

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn) {
      return;
    }
    setState({
      leftFront: state.leftFront.push(
        forza.packet.data.normalizedSuspensionTravel.leftFront
      ),
      rightFront: state.rightFront.push(
        forza.packet.data.normalizedSuspensionTravel.rightFront
      ),
      leftRear: state.leftRear.push(
        forza.packet.data.normalizedSuspensionTravel.leftRear
      ),
      rightRear: state.rightRear.push(
        forza.packet.data.normalizedSuspensionTravel.rightRear
      )
    });
  }, [forza.packet]);

  return (
    <Paper>
      <Card
        title={(<CardTitle title="Suspension" />)}
        body={(
          <>
            <SuspensionGraph
              setA={state.leftFront.data}
              labelA="Left Front"
              setB={state.rightFront.data}
              labelB="Right Front" />
            <SuspensionGraph
              setA={state.leftRear.data}
              labelA="Left Rear"
              setB={state.rightRear.data}
              labelB="Right Rear" />
          </>
        )} />
    </Paper>
  )
}