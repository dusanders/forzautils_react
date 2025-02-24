import React, { useEffect, useReducer } from "react";
import { ThemeText } from "../ThemeText";
import { useForzaData } from "../../context/ForzaContext";
import { StateHandler } from "../../utility/types";
import { LabeledGauge } from "./LabeledGauge";
import { CarInfo, FM8_CarLookup, FM8Car } from "ForzaTelemetryApi";

export interface GearDisplayProps {

}

interface GearDisplayState {
  currentRpm: number;
  minRpm: number;
  maxRpm: number;
  gear: number;
  throttle: number;
  carInfo: FM8Car;
}
const initialState: GearDisplayState = {
  currentRpm: 0,
  minRpm: 0,
  maxRpm: 0,
  gear: 0,
  throttle: 0,
  carInfo: FM8_CarLookup.getCarInfo(2235)!
}
export function GearDisplay(props: GearDisplayProps) {
  const forza = useForzaData();
  const [state, setState] = useReducer<StateHandler<GearDisplayState>>((state, newState) => {
    return { ...state, ...newState }
  }, initialState);

  useEffect(() => {
    if (!forza.packet || !forza.packet.data.isRaceOn || forza.packet.data.gear === 11) {
      return;
    }
    setState({
      currentRpm: forza.packet.data.rpmData.current,
      minRpm: forza.packet.data.rpmData.idle,
      maxRpm: forza.packet.data.rpmData.max,
      gear: forza.packet.data.gear,
      throttle: forza.packet.data.throttle,
      carInfo: FM8_CarLookup.getCarInfo(forza.packet.data.carInfo.ordinalId) || initialState.carInfo,
    });
  }, [forza.packet]);

  return (
    <div>
      <div className="flex flex-col mb-4">
        <ThemeText className="text-center font-bold text-2xl uppercase">
          {state.carInfo?.name}
        </ThemeText>
      </div>
      <div className="flex mb-4 justify-evenly">
        <LabeledGauge
          label="RPM"
          value={Math.round(state.currentRpm)}
          min={state.minRpm}
          max={state.maxRpm} />
        <div className="flex flex-col content-center justify-center">
          <ThemeText className="font-bold text-xl uppercase">
            Gear
          </ThemeText>
          <ThemeText element="h1" className="content-center text-center font-bold mt-4">
            {state.gear}
          </ThemeText>
        </div>
        <LabeledGauge
          label="Throttle"
          value={Math.round(state.throttle)}
          min={0}
          max={100} />
      </div>
    </div>
  )
}