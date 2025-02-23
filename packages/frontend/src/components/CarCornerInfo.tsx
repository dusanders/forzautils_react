import React, { useEffect, useState } from "react";
import { LimitedArray } from "../utility/LimitedArray";
import { useTheme } from "../context/Theme";
import { useForzaData } from "../context/ForzaContext";
import { ForzaTelemetryApi } from "ForzaTelemetryApi";
import { Line } from "react-chartjs-2";
import { ForzaDataEvent } from "@forzautils/core";

export type tire_position = 'leftFront' | 'rightFront' | 'leftRear' | 'rightRear';
export interface CarCornerInfoProps {
  className?: string;
  position: tire_position;
}

interface CarCornerInfoState {
  suspensionTravel: number[];
  tireTemp: number[];
  slipAngle: number[];
}
const initialState: CarCornerInfoState = {
  suspensionTravel: [1, 2, 3, 4, 5],
  tireTemp: [1, 2, 3, 4, 5],
  slipAngle: [1, 2, 3, 4, 5]
}
function getInfoForPosition(position: tire_position, state: ForzaTelemetryApi) {
  switch (position) {
    case 'leftFront':
      return {
        suspensionTravel: state.normalizedSuspensionTravel.leftFront,
        tireTemp: state.tireTemp.leftFront,
        slipAngle: state.tireCombinedSlip.leftFront
      }
    case 'rightFront':
      return {
        suspensionTravel: state.normalizedSuspensionTravel.rightFront,
        tireTemp: state.tireTemp.rightFront,
        slipAngle: state.tireCombinedSlip.rightFront
      }
    case 'leftRear':
      return {
        suspensionTravel: state.normalizedSuspensionTravel.leftRear,
        tireTemp: state.tireTemp.leftRear,
        slipAngle: state.tireCombinedSlip.leftRear
      }
    case 'rightRear':
      return {
        suspensionTravel: state.normalizedSuspensionTravel.rightRear,
        tireTemp: state.tireTemp.rightRear,
        slipAngle: state.tireCombinedSlip.rightRear
      }
  }
}
function getTitleForPosition(position: tire_position) {
  switch (position) {
    case 'leftFront':
      return 'Left Front';
    case 'rightFront':
      return 'Right Front';
    case 'leftRear':
      return 'Left Rear';
    case 'rightRear':
      return 'Right Rear';
  }
  return 'Unknown';
}
function getSuspensionTravelForPosition(position: tire_position, state: LimitedArray<ForzaDataEvent>) {
  switch (position) {
    case 'leftFront':
      return state.data.map(i => i.data.normalizedSuspensionTravel.leftFront);
    case 'rightFront':      
      return state.data.map(i => i.data.normalizedSuspensionTravel.rightFront);
    case 'leftRear':
      return state.data.map(i => i.data.normalizedSuspensionTravel.leftRear);
    case 'rightRear':
      return state.data.map(i => i.data.normalizedSuspensionTravel.rightRear);
  }
  return []
}
function getTireTempForPosition(position: tire_position, state: LimitedArray<ForzaDataEvent>) {
  switch (position) {
    case 'leftFront':     
      return state.data.map(i => i.data.tireTemp.leftFront);  
    case 'rightFront':
      return state.data.map(i => i.data.tireTemp.rightFront);
    case 'leftRear':
      return state.data.map(i => i.data.tireTemp.leftRear);
    case 'rightRear':
      return state.data.map(i => i.data.tireTemp.rightRear);
  }
  return []
}
function getSlipAngleForPosition(position: tire_position, state: LimitedArray<ForzaDataEvent>) {
  switch (position) {
    case 'leftFront':
      return state.data.map(i => i.data.tireCombinedSlip.leftFront);
    case 'rightFront':
      return state.data.map(i => i.data.tireCombinedSlip.rightFront);
    case 'leftRear':
      return state.data.map(i => i.data.tireCombinedSlip.leftRear);
    case 'rightRear':
      return state.data.map(i => i.data.tireCombinedSlip.rightRear);
  }
  return []
}
export function CarCornerInfo(props: CarCornerInfoProps) {
  const theme = useTheme();
  const forza = useForzaData();
  const [state, setState] = useState<CarCornerInfoState>(initialState);

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn) {
      return;
    }
    setState({
      suspensionTravel: getSuspensionTravelForPosition(props.position, forza.dataWindow),
      tireTemp: getTireTempForPosition(props.position, forza.dataWindow),
      slipAngle: getSlipAngleForPosition(props.position, forza.dataWindow)
    });
  }, [forza.dataWindow]);

  return (
    <div className={`flex flex-col mt-2 ${props.className || ''}`}
    style={{
      width: '35%'
    }}>
      <div className="flex w-full">
        <Line
          style={{
            backgroundColor: theme.colors.charts.line.background,
            borderRadius: 6,
            width: '100%',
          }}
          options={{
            maintainAspectRatio: true,
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
            labels: state.suspensionTravel.map(i => ''),
            datasets: [
              {
                label: 'Suspension Travel',
                data: state.suspensionTravel,
              }
            ]
          }} />
      </div>
      <div className="flex flex-row justify-between mt-2">
        <div className="flex w-50% mr-2">
        <Line
          style={{
            backgroundColor: theme.colors.charts.line.background,
            borderRadius: 6,
            width: '100%',
          }}
          options={{
            maintainAspectRatio: true,
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
            labels: state.suspensionTravel.map(i => ''),
            datasets: [
              {
                label: 'Slip Angle',
                data: state.slipAngle,
              }
            ]
          }} />
        </div>
        <div className="flex w-50%">
        <Line
          style={{
            backgroundColor: theme.colors.charts.line.background,
            borderRadius: 6,
            width: '100%',
          }}
          options={{
            maintainAspectRatio: true,
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
            labels: state.tireTemp.map(i => ''),
            datasets: [
              {
                label: 'Temp',
                data: state.tireTemp,
              }
            ]
          }} />
        </div>
      </div>
    </div>
  )
}