import { useEffect, useState } from "react";
import { Paper } from "./Paper";
import { Card } from "./Card";
import { CardTitle } from "./CardTitle";
import { LimitedArray } from "../utility/LimitedArray";
import { useForzaData } from "../context/ForzaContext";
import { StackedLineGraph } from "./StackedLineGraph";
import { useTheme } from "../context/Theme";

export interface SuspensionProps {

}

interface SuspensionState {
  leftFront: LimitedArray<number>;
  rightFront: LimitedArray<number>;
  leftRear: LimitedArray<number>;
  rightRear: LimitedArray<number>;
  yaw: LimitedArray<number>;
  pitch: LimitedArray<number>;
  roll: LimitedArray<number>;
}
const initialState: SuspensionState = {
  leftFront: new LimitedArray(20, [2, 1, 3, 4, 1, 2, 5]),
  rightFront: new LimitedArray(20, [3, 1, 2, 3, 4, 2, 6]),
  leftRear: new LimitedArray(20, [5, 4, 3, 2, 1, 2, 3]),
  rightRear: new LimitedArray(20, [4, 3, 2, 1, 5, 6]),
  yaw: new LimitedArray(20, [9, 3, 2, 3, 4, 5, 3]),
  pitch: new LimitedArray(20, [5, 3, 2, 1, 4, 3, 2]),
  roll: new LimitedArray(20, [6, 5, 7, 8, 3, 1, 2])
}

export function Suspension(props: SuspensionProps) {
  const theme = useTheme();
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
      ),
      yaw: state.yaw.push(
        forza.packet.data.yaw
      ),
      pitch: state.pitch.push(
        forza.packet.data.pitch
      ),
      roll: state.pitch.push(
        forza.packet.data.roll
      )
    });
  }, [forza.packet]);

  return (
    <Paper innerClassName="justify-between flex flex-col h-full">
      <Card
        title={(<CardTitle title="Suspension" />)}
        body={(
          <>
            <StackedLineGraph
              title="SUSPENSION TRAVEL"
              data={[
                {
                  label: 'Left Front',
                  data: state.leftFront.data,
                  borderColor: theme.colors.charts.leftFrontColor,
                  backgroundColor: theme.colors.charts.leftFrontColor
                },
                {
                  label: 'Right Front',
                  data: state.rightFront.data,
                  borderColor: theme.colors.charts.rightFrontColor,
                  backgroundColor: theme.colors.charts.rightFrontColor
                },
                {
                  label: 'Left Rear',
                  data: state.leftRear.data,
                  borderColor: theme.colors.charts.leftRearColor,
                  backgroundColor: theme.colors.charts.leftRearColor
                },
                {
                  label: 'Right Rear',
                  data: state.rightRear.data,
                  borderColor: theme.colors.charts.rightRearColor,
                  backgroundColor: theme.colors.charts.rightRearColor
                }
              ]} />
            <StackedLineGraph
              title="CHASSIS ANGLE"
              data={[
                {
                  label: 'Yaw',
                  data: state.yaw.data,
                  borderColor: theme.colors.charts.yawColor,
                  backgroundColor: theme.colors.charts.yawColor
                },
                {
                  label: 'Pitch',
                  data: state.pitch.data,
                  borderColor: theme.colors.charts.pitchColor,
                  backgroundColor: theme.colors.charts.pitchColor
                },
                {
                  label: 'Roll',
                  data: state.roll.data,
                  borderColor: theme.colors.charts.rollColor,
                  backgroundColor: theme.colors.charts.rollColor
                }
              ]} />
          </>
        )} />
    </Paper>
  )
}