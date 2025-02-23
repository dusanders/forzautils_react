import React, { memo, useEffect, useReducer, useState } from "react";
import { ThemeText } from "../ThemeText";
import { Utils } from "../../utility/Utils";
import { useTheme } from "../../context/Theme";
import { useScreenDimensions } from "../../hooks/useScreenDimensions";
import { LineChart, LineSeriesType } from "@mui/x-charts";
import { useForzaData } from "../../context/ForzaContext";
import { StateHandler } from "../../utility/types";


export interface GearData {
  gear: number;
  dataPoints: RpmDataPoint[];
}

export interface RpmDataPoint {
  rpm: number;
  hp: number;
  tq: number;
}

interface HpTqCurveProps {
  dataPoints: RpmDataPoint[];
}

const HpGraph = memo((props: HpTqCurveProps) => {
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
});

interface TabItemProps {
  label: string;
  index: number;
  onClick: (index: number) => void;
}
function TabItem(props: TabItemProps) {
  const theme = useTheme();
  return (
    <li key={Utils.randomKey()}
      className={`me-2 p-2 ${theme.colors.background.tabs.hover} ${props.index === 0
        ? theme.colors.background.tabs.indicator
        : theme.colors.background.tabs.background
        } rounded-b-sm cursor-pointer`}
      onClick={() => {
        console.log(`Clicked tab ${props.index}`);
        props.onClick(props.index);
      }}>
      <ThemeText className={`cursor-pointer`}>
        {props.label}
      </ThemeText>
    </li>
  )
}

function roundedRpm(rpm: number) {
  return Math.round(rpm / 100) * 100;
}
function isRpmStep(rpm: number) {
  const isStep = (roundedRpm(rpm) % 100) === 0;
  return isStep;
}
function isDecel(rpm: number, gearData: GearData) {
  if (!gearData || !gearData.dataPoints.length) {
    return false;
  }
  const lastDataPoint = gearData.dataPoints[gearData.dataPoints.length - 1];
  return roundedRpm(rpm) < lastDataPoint.rpm;
}
function findOrCreateGearData(gear: number, allGears: GearData[]) {
  let currentGearData = allGears.find(i => i.gear === gear);
  if (!currentGearData) {
    allGears.push({ gear: gear, dataPoints: [] });
    currentGearData = allGears.find(i => i.gear === gear);
    if (!currentGearData) {
      throw new Error(`Failed to create gear data for gear ${gear}`); // This should never happen
    }
    // Add a new data point
    currentGearData.dataPoints.push({
      rpm: 0,
      hp: 0,
      tq: 0
    });
  }
  return currentGearData;
}
function addOrUpdateDataPoint(rpm: number, gear: number, hp: number, tq: number, allGears: GearData[]) {
  let currentGearData = findOrCreateGearData(gear, allGears);
  if(!isRpmStep(roundedRpm(rpm)) || isDecel(rpm, currentGearData!)) {
    return [...allGears];
  }
  const found = currentGearData!.dataPoints.find((i) => i.rpm === roundedRpm(rpm));
  if (found) {
    if (found.hp < hp) {
      found.hp = hp;
    }
    if (found.tq < tq) {
      found.tq = tq;
    }
  } else {
    // Add a new data point
    currentGearData!.dataPoints.push({
      rpm: roundedRpm(rpm),
      hp: hp,
      tq: tq
    });
  }
  return [...allGears];
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
export interface HpTqCollectionProps {
  // Nothing here
}
interface HpTqCollectionState {
  gears: GearData[];
}
const initialState: HpTqCollectionState = {
  gears: debugData
}
export function HpTqCollection(props: HpTqCollectionProps) {
  const theme = useTheme();
  const forza = useForzaData();
  const [state, setState] = useReducer<StateHandler<HpTqCollectionState>>((prev, next) => {
    return { ...prev, ...next };
  }, initialState);
  const [activeTab, setActiveTab] = useState(0);
  const [activeChart, setActiveChart] = useState<GearData>(state.gears[0]);

  useEffect(() => {
    setActiveChart(state.gears[activeTab]);
  }, [activeTab]);

  useEffect(() => {
    if(forza.packet && forza.packet.data.isRaceOn) {
      setState({
        gears: addOrUpdateDataPoint(
          forza.packet.data.rpmData.current,
          forza.packet.data.gear,
          forza.packet.data.getHorsepower(),
          forza.packet.data.torque,
          state.gears
        )
      });
    }
  }, [forza.packet]);

  return (
    <div>
      <div className={`flex w-full min-h-8 rounded-t-lg`}>
        <HpGraph
          dataPoints={activeChart.dataPoints} />
      </div>
      <ul className="flex flex-wrap me-2 ms-2">
        {state.gears.map((i, index) => {
          return (
            <TabItem
              key={Utils.randomKey()}
              label={`Gear ${i.gear}`}
              index={index}
              onClick={(index) => {
                setActiveTab(index);
              }} />
          );
        })
        }
      </ul>
    </div>
  )
}