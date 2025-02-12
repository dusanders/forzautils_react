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
import { FM8_CarLookup } from "ForzaTelemetryApi";

export interface EngineInfoProps {

}

interface GearData {
  gear: number;
  dataPoints: RpmDataPoint[];
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
    label: 'Horsepower',
    id: 'hp',
    showMark: false
  };
  const tqSeries: LineSeriesType = {
    type: 'line',
    data: props.dataPoints.map(i => i.tq),
    label: 'Torque',
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

interface HpTqCollectionProps {
  gears: GearData[];
}
function HpTqCollection(props: HpTqCollectionProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [activeChart, setActiveChart] = useState<GearData>(props.gears[0]);

  const tabItem = (label: string, index: number) => {
    return (
      <li key={Utils.randomKey()}
        className={`me-2 p-2 ${theme.colors.background.tabs.hover} ${index === activeTab ? theme.colors.background.tabs.indicator : theme.colors.background.tabs.background} rounded-b-sm cursor-pointer`}
        onClick={() => {
          setActiveTab(index);
          setActiveChart(props.gears[index]);
        }}>
        <Text className={`cursor-pointer`}>
          {label}
        </Text>
      </li>
    )
  }

  return (
    <div>
      <div className={`flex w-full min-h-8 rounded-t-lg`}>
        <HpTqCurve
          dataPoints={activeChart.dataPoints} />
      </div>
      <ul className="flex flex-wrap me-2 ms-2">
        {props.gears.map((i, index) => tabItem(`Gear ${i.gear}`, index))}
      </ul>
    </div>
  )
}

interface EngineInfoState {
  gearData: GearData[];
  currentRpm: number;
  minRpm: number;
  maxRpm: number;
  gear: number;
  throttle: number;
}
const debugData = [
  {
    gear: 1, dataPoints: [
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
    ]
  },
  {
    gear: 2, dataPoints: [
      {
        rpm: 3200,
        hp: 140,
        tq: 120
      },
      {
        rpm: 3300,
        hp: 160,
        tq: 135
      },
      {
        rpm: 3400,
        hp: 165,
        tq: 145
      },
      {
        rpm: 3500,
        hp: 160,
        tq: 155
      },
      {
        rpm: 3600,
        hp: 150,
        tq: 165
      }
    ]
  }
]
const initialState: EngineInfoState = {
  gearData: debugData,
  minRpm: 0,
  maxRpm: 9000,
  currentRpm: 0,
  gear: 0,
  throttle: 0
}
export function EngineInfo(props: EngineInfoProps) {
  const theme = useTheme();
  const forza = useForzaData();
  const [engineInfo, setEngineInfo] = useState<EngineInfoState>(initialState);

  const roundedRpm = () => {
    return Math.round(forza.packet!.data.rpmData.current);
  }
  // Don't add duplicates - update existing data points
  const addOrUpdateDataPoint = () => {
    let gearData = engineInfo.gearData.find(i => i.gear === forza.packet!.data.gear);
    if (!gearData) {
      engineInfo.gearData.push({ gear: forza.packet!.data.gear, dataPoints: [] });
      gearData = engineInfo.gearData.find(i => i.gear === forza.packet!.data.gear);
    }
    const found = gearData!.dataPoints.find((i) => i.rpm === roundedRpm());
    if (found) {
      if (found.hp < forza.packet!.data.getHorsepower()) {
        found.hp = forza.packet!.data.getHorsepower();
      }
      if (found.tq < forza.packet!.data.torque) {
        found.tq = forza.packet!.data.torque;
      }
    } else {
      gearData!.dataPoints.push({
        rpm: roundedRpm(),
        hp: forza.packet!.data.getHorsepower(),
        tq: forza.packet!.data.torque
      });
    }
    return [...engineInfo.gearData];
  }

  // Check if we are in decel situation
  const isDecel = () => {
    const gearData = engineInfo.gearData.find(i => i.gear === forza.packet!.data.gear);
    if (!gearData || !gearData.dataPoints.length) {
      return false;
    }
    const lastDataPoint = gearData.dataPoints[gearData.dataPoints.length - 1];
    return roundedRpm() < lastDataPoint.rpm;
  }

  // We only want to capture steps of RPM, not every data point!
  const isRpmStep = () => {
    const isStep = (roundedRpm() % 100) === 0;
    return isStep;
  }

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn
      || forza.packet.data.gear === 0 || forza.packet.data.gear === 11) {
      return;
    }
    setEngineInfo({
      gearData: (isRpmStep() && !isDecel())
        ? addOrUpdateDataPoint()
        : engineInfo.gearData,
      minRpm: forza.packet.data.rpmData.idle,
      maxRpm: forza.packet.data.rpmData.max,
      currentRpm: roundedRpm(),
      gear: forza.packet.data.gear,
      throttle: Math.round(forza.packet.data.throttle)
    })
  }, [forza.packet]);

  const carInfo = FM8_CarLookup.getCarInfo(forza.packet?.data.carInfo.ordinalId || 2235);

  return (
    <div className="flex flex-col inline-block mt-4 mb-4">
      <div className="flex flex-col mb-4">
        <Text className="text-center font-bold text-2xl uppercase">
          {carInfo?.name}
        </Text>
      </div>
      <div className="flex mb-4 justify-evenly">
        <LabeledGauge
          label="RPM"
          value={engineInfo.currentRpm}
          min={engineInfo.minRpm}
          max={engineInfo.maxRpm} />
        <GearDisplay gear={engineInfo.gear} />
        <LabeledGauge
          label="Throttle"
          value={engineInfo.throttle}
          min={0}
          max={100} />
      </div>
      <HpTqCollection
        gears={engineInfo.gearData} />
    </div>
  )
}