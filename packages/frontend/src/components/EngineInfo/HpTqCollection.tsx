import React, { memo, useEffect, useMemo, useReducer, useState } from "react";
import { ThemeText } from "../ThemeText";
import { Utils } from "../../utility/Utils";
import { useTheme } from "../../context/Theme";
import { useScreenDimensions } from "../../hooks/useScreenDimensions";
import { useForzaData } from "../../context/ForzaContext";
import { StateHandler } from "../../utility/types";
import { Line } from "react-chartjs-2";


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

function HpGraph(props: HpTqCurveProps) {
  const theme = useTheme();
  const rpmPoints = props.dataPoints.map(i => i.rpm)
  
  return (
    <Line
    style={{
      backgroundColor: theme.colors.charts.line.background,
      borderRadius: 6,
      width: '100%',
    }}
    options={{
      maintainAspectRatio: false,
      responsive: true,
      spanGaps: true,
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
            boxWidth: 8,
            boxHeight: 8,
            useBorderRadius: true,
            borderRadius: 2,
            color: theme.colors.charts.line.valueLabel,
            font: {
              size: 12
            }
          }
        }
      }
    }}
    data={{
      labels: rpmPoints,
      datasets: [
        {
          label: 'Horsepower',
          data: props.dataPoints.map(i => i.hp),
          borderColor: theme.colors.charts.leftFrontColor,
          backgroundColor: theme.colors.charts.leftFrontColor,
        },
        {
          label: 'Torque',
          data: props.dataPoints.map(i => i.tq),
          borderColor: theme.colors.charts.rightFrontColor,
          backgroundColor: theme.colors.charts.rightFrontColor,
        }
      ]
    }} />
  )
}

interface TabItemProps {
  label: string;
  index: number;
  isSelected: boolean;
  onClick: (index: number) => void;
}
function TabItem(props: TabItemProps) {
  const theme = useTheme();
  return (
    <li key={Utils.randomKey()}
      className={`me-2 p-2 ${theme.colors.background.tabs.hover} ${props.isSelected
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
  }
  return currentGearData;
}
function addOrUpdateDataPoint(rpm: number, gear: number, hp: number, tq: number, allGears: GearData[]): boolean {
  if(hp < 0) {
    return false;
  }
  let currentGearData = findOrCreateGearData(gear, allGears);
  if (!isRpmStep(roundedRpm(rpm)) || isDecel(rpm, currentGearData!)) {
    return false;
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
  return true;
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
  const size = useScreenDimensions();
  const width = Utils.getGraphWidth(size.dimensions.innerWidth);
  const [state, setState] = useReducer<StateHandler<HpTqCollectionState>>((prev, next) => {
    return { ...prev, ...next };
  }, initialState);
  const [activeTab, setActiveTab] = useState(0);
  const [activeChart, setActiveChart] = useState<GearData>(state.gears[0]);
  const tabs = useMemo(() => {
    return state.gears.sort((a,b) => {return a.gear - b.gear}).map((i, index) => (
      <TabItem
        isSelected={index === activeTab}
        key={Utils.randomKey()}
        label={`Gear ${i.gear}`}
        index={index}
        onClick={(index) => {
          setActiveTab(index);
        }} />
    )
    )
  }, [state.gears, activeTab]);

  useEffect(() => {
    setActiveChart(state.gears[activeTab]);
  }, [activeTab]);

  useEffect(() => {
    if (forza.packet && forza.packet.data.isRaceOn && (forza.packet.data.gear !== 11 && forza.packet.data.gear !== 0)) {
      const didUpdate = addOrUpdateDataPoint(
        forza.packet.data.rpmData.current,
        forza.packet.data.gear,
        forza.packet.data.getHorsepower(),
        forza.packet.data.torque,
        state.gears
      );
      if (didUpdate) {
        setState({ gears: [...state.gears] });
      }
    }
  }, [forza.packet]);

  return (
    <div className="w-full flex flex-col" style={{
      width: width,
    }}>
      <div className={`flex w-full min-h-8 rounded-t-lg`}>
        <HpGraph
          dataPoints={activeChart.dataPoints} />
      </div>
      <ul className="flex flex-wrap me-2 ms-2">
        {tabs}
      </ul>
    </div>
  )
}