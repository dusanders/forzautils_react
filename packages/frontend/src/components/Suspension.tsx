import React, { useEffect, useRef, useState } from "react";
import { Paper } from "./Paper";
import { Card } from "./Card";
import { CardTitle } from "./CardTitle";
import { LineChart, LineSeriesType, SparkLineChart } from "@mui/x-charts";
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { Utils } from "../utility/Utils";
import { useTheme } from "../context/Theme";
import { useScreenDimensions } from "../hooks/useScreenDimensions";
import { LimitedArray } from "../utility/LimitedArray";
import { useForzaData } from "../context/ForzaContext";

interface SuspensionGraphProps {
  setA: number[];
  setB: number[];
  labelA: string;
  labelB: string;
  ref?: any;
}

function SuspensionGraph(props: SuspensionGraphProps) {
  const theme = useTheme();
  const size = useScreenDimensions();

  // const seriesA: LineSeriesType = {
  //   type: 'line',
  //   data: props.setA,
  //   label: props.labelA,
  //   id: Utils.randomKey(),
  //   disableHighlight: true,
  //   showMark: false
  // };
  // const seriesB: LineSeriesType = {
  //   type: 'line',
  //   data: props.setB,
  //   label: props.labelB,
  //   id: Utils.randomKey(),
  //   disableHighlight: true,
  //   showMark: false,
  // }

  return (
    <>
      <Line
        ref={props.ref}
        className="mt-2"
        id={Utils.randomKey()}
        style={{
          backgroundColor: theme.colors.charts.line.background,
          borderRadius: 6
        }}
        width={Utils.getGraphWidth(size.dimensions.innerWidth)}
        options={{
          spanGaps: true,
          aspectRatio: 16 / 9,
          elements: {
            point: {
              pointStyle: false,
              radius: 0
            },
            line: {
              tension: 0.3
            }
          },
          scales: {
            y: {
              ticks: {
                color: theme.colors.charts.line.valueLabel
              },
              grid: {
                display: false
              }
            }
          },
          plugins: {
            tooltip: {
              enabled: false
            },
            legend: {
              labels: {
                boxWidth: 18,
                useBorderRadius: true,
                borderRadius: 2,
                color: theme.colors.charts.line.valueLabel,
                font: {
                  size: 18
                }
              }
            }
          }
        }}
        data={{
          labels: props.setA.map(i => ''),
          datasets: [
            {
              label: props.labelA,
              data: props.setA,
              borderColor: 'rgb(2, 178, 175)',
              backgroundColor: 'rgb(2, 178, 175)',
            },
            {
              label: props.labelB,
              data: props.setB,
              borderColor: 'rgb(46, 150, 255)',
              backgroundColor: 'rgb(46, 150, 255)',
            }
          ]
        }} />
      {/* <LineChart
        className="m-2"
        height={300}
        width={Utils.getGraphWidth(size.dimensions.innerWidth)}
        series={[
          seriesA,
          seriesB
        ]}
        axisHighlight={{ x: 'none', y: 'none' }}
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
        }} /> */}
    </>
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
  leftFront: new LimitedArray(20, [2, 1, 3, 4, 1, 2, 5]),
  rightFront: new LimitedArray(20, [3, 1, 2, 3, 4, 2, 6]),
  leftRear: new LimitedArray(20, [5, 4, 3, 2, 1, 2, 3]),
  rightRear: new LimitedArray(20, [4, 3, 2, 1, 5, 6])
}

export function Suspension(props: SuspensionProps) {
  const forza = useForzaData();
  const [state, setState] = useState<SuspensionState>(initialState);

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn) {
      return;
    }

    console.log(`new sus len ${state.leftFront.data.length}`);

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