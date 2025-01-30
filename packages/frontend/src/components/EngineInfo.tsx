import { Gauge, LineChart, LineSeriesType } from "@mui/x-charts";
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/Theme";
import { Paper } from "./Paper";
import { useForzaData } from "../hooks/useForzaData";
import { Text } from "./Text";
import { Utils } from "../utility/Utils";
import { Card } from "./Card";
import { CardTitle } from "./CardTitle";

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
  const rpmPoints = props.dataPoints.map(i => i.rpm)
  const hpSeries: LineSeriesType = {
    type: 'line',
    data: props.dataPoints.map(i => i.hp),
    label: 'HP',
    id: 'hp',
  };
  const tqSeries: LineSeriesType = {
    type: 'line',
    data: props.dataPoints.map(i => i.tq),
    label: 'TQ',
    id: 'tq',
  }
  return (
    <LineChart
      height={300}
      width={300}
      xAxis={[{
        data: rpmPoints,
      }]}
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

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn) {
      return;
    }
    let dataPoints = [...engineInfo.dataPoints];
    // Reset the HP/TQ data points if we are in a new gear
    if (forza.packet.data.gear !== engineInfo.gear) {
      dataPoints = [];
    } else {
      dataPoints.push({
        rpm: forza.packet.data.rpmData.current,
        hp: forza.packet.data.getHorsepower(),
        tq: forza.packet.data.torque
      });
    }
    setEngineInfo({
      dataPoints: dataPoints,
      minRpm: forza.packet.data.rpmData.idle,
      maxRpm: forza.packet.data.rpmData.max,
      currentRpm: forza.packet.data.rpmData.current,
      gear: forza.packet.data.gear,
      throttle: forza.packet.data.throttle
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
            <div className="flex mb-4 justify-between">
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