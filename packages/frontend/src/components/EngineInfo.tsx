import { Gauge, LineChart, LineSeriesType } from "@mui/x-charts";
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/Theme";
import { Paper } from "./Paper";
import { Text } from "./Text";
import { Utils } from "../utility/Utils";
import { Card } from "./Card";
import { CardTitle } from "./CardTitle";
import { useScreenDimensions } from "../hooks/useScreenDimensions";
import { useForzaData } from "../context/ForzaContext";

export interface EngineInfoProps {

}

interface RpmDataPoint {
  rpm: number;
  hp: number;
  tq: number;
}

interface HpTqCurveProps {
  dataPoints: RpmDataPoint[];
}

function HpTqCurve(props: HpTqCurveProps) {
  const theme = useTheme();
  const size = useScreenDimensions();
  const rpmPoints = props.dataPoints.map(i => i.rpm)
  const hpSeries: LineSeriesType = {
    type: 'line',
    data: props.dataPoints.map(i => i.hp),
    label: 'HP',
    id: 'hp',
    showMark: false
  };
  const tqSeries: LineSeriesType = {
    type: 'line',
    data: props.dataPoints.map(i => i.tq),
    label: 'TQ',
    id: 'tq',
    showMark: false
  }
  return (
    <LineChart
      height={300}
      width={Utils.getGraphWidth(size.dimensions.innerWidth)}
      xAxis={[{
        data: rpmPoints,
      }]}
      axisHighlight={{ x: 'none', y: 'none' }}
      series={[hpSeries, tqSeries]}
      title="Horsepower"
      sx={{
        backgroundColor: theme.colors.charts.line.background,
        borderRadius: 2,
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

interface GearDisplayProps {
  gear: number;
}
function GearDisplay(props: GearDisplayProps) {
  return (
    <div className="flex flex-col content-center justify-center">
      <Text className="font-bold text-xl uppercase">
        Gear
      </Text>
      <Text element="h1" className="content-center text-center font-bold mt-4">
        {props.gear}
      </Text>
    </div>
  )
}

interface LabeledGaugeProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
}
function LabeledGauge(props: LabeledGaugeProps) {
  const theme = useTheme();
  const labelId = `labeledGauge_${Utils.randomKey()}`;
  return (
    <div className="flex flex-col content-center justify-center">
      <Text id={labelId} className="text-center text-xl font-bold uppercase">
        {props.label}
      </Text>
      <Gauge
        aria-labelledby={labelId}
        height={100}
        width={100}
        valueMin={props.min === undefined ? 0 : props.min}
        valueMax={props.max === undefined ? 100 : props.max}
        value={props.value}
        aria-label={'Label'}
        sx={{
          '.MuiGauge-valueText': {
            '& text': {
              fill: theme.colors.charts.line.valueLabel
            }
          }
        }} />
    </div>
  )
}

interface EngineInfoState {
  dataPoints: RpmDataPoint[];
  currentRpm: number;
  minRpm: number;
  maxRpm: number;
  gear: number;
  throttle: number;
}
const initialState: EngineInfoState = {
  dataPoints: [
    {
      rpm: 1200,
      hp: 120,
      tq: 80
    },
    {
      rpm: 1300,
      hp: 130,
      tq: 90
    },
    {
      rpm: 1400,
      hp: 135,
      tq: 110
    },
    {
      rpm: 1500,
      hp: 120,
      tq: 125
    },
    {
      rpm: 1600,
      hp: 110,
      tq: 135
    }
  ],
  minRpm: 800,
  maxRpm: 9000,
  currentRpm: 0,
  gear: 0,
  throttle: 0
}
export function EngineInfo(props: EngineInfoProps) {
  const theme = useTheme();
  const forza = useForzaData();
  const [engineInfo, setEngineInfo] = useState<EngineInfoState>(initialState);

  // Don't add duplicates - update existing data points
  const addOrUpdateDataPoint = (dataPoints: RpmDataPoint[]) => {
    const found = engineInfo.dataPoints.find((i) => i.rpm === forza.packet?.data.rpmData.current);
    if (found) {
      if (found.hp < forza.packet!.data.getHorsepower()) {
        found.hp = forza.packet!.data.getHorsepower();
      }
      if (found.tq < forza.packet!.data.torque) {
        found.tq = forza.packet!.data.torque;
      }
    } else {
      dataPoints.push({
        rpm: Math.round(forza.packet!.data.rpmData.current),
        hp: forza.packet!.data.getHorsepower(),
        tq: forza.packet!.data.torque
      });
    }
    return dataPoints;
  }

  // Check if we are in decel situation
  const isDecel = (dataPoints: RpmDataPoint[]) => {
    return forza.packet!.data.rpmData.current < dataPoints[dataPoints.length - 1].rpm
  }

  // We only want to capture steps of RPM, not every data point!
  const isRpmStep = () => {
    return (Math.round(forza.packet!.data.rpmData.current) % 100) === 0;
  }

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn
      || !isRpmStep() || isDecel(engineInfo.dataPoints)) {
      return;
    }
    let dataPoints = [...engineInfo.dataPoints];
    // Reset the HP/TQ data points if we are in a new gear
    if (forza.packet.data.gear !== engineInfo.gear) {
      dataPoints = [];
    } else {
      dataPoints = addOrUpdateDataPoint(dataPoints);
    }
    setEngineInfo({
      dataPoints: dataPoints,
      minRpm: forza.packet.data.rpmData.idle,
      maxRpm: forza.packet.data.rpmData.max,
      currentRpm: Math.round(forza.packet.data.rpmData.current),
      gear: forza.packet.data.gear,
      throttle: Math.round(forza.packet.data.throttle)
    })
  }, [forza.packet]);

  return (
    <Paper innerClassName="justify-between flex flex-col h-full">
      <Card
        title={(
          <CardTitle title="Engine Information" />
        )}
        body={(
          <>
            <div className="flex mb-4 justify-evenly">
              <LabeledGauge
                label="RPM"
                value={engineInfo.currentRpm || (engineInfo.maxRpm * 0.3)}
                min={engineInfo.minRpm}
                max={engineInfo.maxRpm} />
              <GearDisplay gear={engineInfo.gear} />
              <LabeledGauge
                label="Throttle"
                value={engineInfo.throttle || 90} />
            </div>
            <HpTqCurve
              dataPoints={engineInfo.dataPoints} />
          </>
        )} />
    </Paper>
  )
}