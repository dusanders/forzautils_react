import React, { useEffect, useRef } from "react";
import { Chart, ChartDataset, registerables } from 'chart.js';
import { Line } from "react-chartjs-2";
import { useScreenDimensions } from "../hooks/useScreenDimensions";
import { Utils } from "../utility/Utils";
import { useTheme } from "../context/Theme";
Chart.register(...registerables);


export interface StackedLineGraphProps {
  ref?: any;
  title?: string;
  data?: ChartDataset<'line', number[]>[];
}

export function StackedLineGraph(props: StackedLineGraphProps) {
  const theme = useTheme();
  const size = useScreenDimensions();
  const labels = props.data
    ? props.data[0].data.map(i => '')
    : [];

  return (
    <div className={`relative flex flex-col mt-2 content-center items-center`}
      style={{
        height: `${Math.round(size.dimensions.innerHeight * 0.3)}px`,
        width: `${Utils.getGraphWidth(size.dimensions.innerWidth)}px`
      }}>
      <Line
        id={Utils.randomKey()}
        style={{
          backgroundColor: theme.colors.charts.line.background,
          borderRadius: 6,
          height: '100%',
          width: '100%'
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
            title: {
              text: props.title || '',
              display: props.title !== undefined,
              color: theme.colors.charts.line.valueLabel,
              font: {
                size: 18
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
          labels: labels,
          datasets: props.data || []
        }} />
    </div>
  )
}