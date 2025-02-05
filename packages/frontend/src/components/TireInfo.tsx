import React, { useEffect, useState } from "react";
import { Paper } from "./Paper";
import { Card } from "./Card";
import { CardTitle } from "./CardTitle";
import { LimitedArray } from "../utility/LimitedArray";
import { Bar } from "react-chartjs-2";
import { useTheme } from "../context/Theme";
import { useScreenDimensions } from "../hooks/useScreenDimensions";
import { StackedLineGraph } from "./StackedLineGraph";
import { useForzaData } from "../context/ForzaContext";
import { Utils } from "../utility/Utils";

export interface TireInfoProps {

}

interface TireInfoState {
  leftFrontTemp: LimitedArray<number>;
  rightFrontTemp: LimitedArray<number>;
  leftRearTemp: LimitedArray<number>;
  rightRearTemp: LimitedArray<number>;
  leftFrontSlip: LimitedArray<number>;
  rightFrontSlip: LimitedArray<number>;
  leftRearSlip: LimitedArray<number>;
  rightRearSlip: LimitedArray<number>;
}
const initialState: TireInfoState = {
  leftFrontTemp: new LimitedArray(20, [123, 132, 143, 153, 123]),
  rightFrontTemp: new LimitedArray(20, [154, 132, 123, 154, 123]),
  leftRearTemp: new LimitedArray(20, [110, 114, 120, 132, 145]),
  rightRearTemp: new LimitedArray(20, [112, 118, 123, 134, 143]),
  leftFrontSlip: new LimitedArray(20, [-2, -4, 5, -12, 12, 13, 23]),
  rightFrontSlip: new LimitedArray(20, [1, 13, -4, -10, -12, 14, 1]),
  leftRearSlip: new LimitedArray(20, [13, 14, 19, 12, 14, 12]),
  rightRearSlip: new LimitedArray(20, [14, 12, 11, 10, -14, -20])
}
export function TireInfo(props: TireInfoProps) {
  const theme = useTheme();
  const size = useScreenDimensions();
  const forza = useForzaData();
  const [state, setState] = useState<TireInfoState>(initialState);

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn) {
      return;
    }
    setState({
      leftFrontTemp: state.leftFrontTemp.push(
        forza.packet.data.tireTemp.leftFront
      ),
      rightFrontTemp: state.rightFrontTemp.push(
        forza.packet.data.tireTemp.rightFront
      ),
      leftRearTemp: state.leftRearTemp.push(
        forza.packet.data.tireTemp.leftRear
      ),
      rightRearTemp: state.rightRearTemp.push(
        forza.packet.data.tireTemp.rightRear
      ),
      leftFrontSlip: state.leftFrontSlip.push(
        forza.packet.data.tireCombinedSlip.leftFront
      ),
      rightFrontSlip: state.rightFrontSlip.push(
        forza.packet.data.tireCombinedSlip.rightFront
      ),
      leftRearSlip: state.leftRearSlip.push(
        forza.packet.data.tireCombinedSlip.leftRear
      ),
      rightRearSlip: state.rightRearSlip.push(
        forza.packet.data.tireCombinedSlip.rightRear
      )
    });
  }, [forza.packet]);

  return (
    <Paper>
      <Card
        title={(<CardTitle title="Tire Information" />)}
        body={(
          <>
            <div className={`relative`} style={{
              height: `${Math.round(size.dimensions.innerHeight * 0.25)}px`,
              width: `${Utils.getGraphWidth(size.dimensions.innerWidth)}px`
            }}>
              <Bar
                style={{
                  backgroundColor: theme.colors.charts.line.background,
                  borderRadius: 6
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
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
                    title: {
                      display: true,
                      text: 'TIRE TEMP',
                      color: theme.colors.charts.line.valueLabel,
                      font: {
                        size: 18,

                      }
                    },
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
                  labels: state.leftFrontTemp.data.map(i => ''),
                  datasets: [
                    {
                      label: 'Left Front',
                      data: state.leftFrontTemp.data,
                      backgroundColor: theme.colors.charts.leftFrontColor
                    },
                    {
                      label: 'Right Front',
                      data: state.rightFrontTemp.data,
                      backgroundColor: theme.colors.charts.rightFrontColor
                    },
                    {
                      label: 'Left Rear',
                      data: state.leftRearTemp.data,
                      backgroundColor: theme.colors.charts.leftRearColor
                    },
                    {
                      label: 'Right Rear',
                      data: state.rightRearTemp.data,
                      backgroundColor: theme.colors.charts.rightRearColor
                    }
                  ]
                }} />
            </div>
            <StackedLineGraph
              title="SLIP ANGLE"
              data={[
                {
                  label: 'Left Front',
                  data: state.leftFrontSlip.data,
                  backgroundColor: theme.colors.charts.leftFrontColor,
                  borderColor: theme.colors.charts.leftFrontColor
                },
                {
                  label: 'Right Front',
                  data: state.rightFrontSlip.data,
                  backgroundColor: theme.colors.charts.rightFrontColor,
                  borderColor: theme.colors.charts.rightFrontColor
                },
                {
                  label: 'Left Rear',
                  data: state.leftRearSlip.data,
                  backgroundColor: theme.colors.charts.leftRearColor,
                  borderColor: theme.colors.charts.leftRearColor
                },
                {
                  label: 'Right Rear',
                  data: state.rightRearSlip.data,
                  backgroundColor: theme.colors.charts.rightRearColor,
                  borderColor: theme.colors.charts.rightRearColor
                }
              ]} />
          </>
        )} />
    </Paper>
  )
}