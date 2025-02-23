import { Gauge } from "@mui/x-charts";
import React from "react";
import { Utils } from "../../utility/Utils";
import { ThemeText } from "../ThemeText";
import { useTheme } from "../../context/Theme";

export interface LabeledGaugeProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
}
export function LabeledGauge(props: LabeledGaugeProps) {
  const theme = useTheme();
  const labelId = `labeledGauge_${Utils.randomKey()}`;
  return (
    <div className="flex flex-col content-center justify-center">
      <ThemeText id={labelId} className="text-center text-xl font-bold uppercase">
        {props.label}
      </ThemeText>
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