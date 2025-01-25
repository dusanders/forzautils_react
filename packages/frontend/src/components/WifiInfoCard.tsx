import React from "react";
import { useWifiInfo } from "../hooks/useWifiInfo";
import { Text } from './Text';

export interface WifiInfoCardProps {

}

function GridCell(props: { children: any }) {
  return (
    <div className="col-span-1 m-0">
      {props.children}
    </div>
  )
}

interface BlinkDotProps {
  color: string;
}
function BlinkDot(props: BlinkDotProps) {
  return (
    <div className="relative h-[0.7rem] w-[0.7rem] flex mr-2 rounded-[1rem] self-center">
      <div className={`absolute animate-ping ${props.color} h-full w-full rounded-[1rem] self-center`} />
      <div className={`relative ${props.color} h-full w-full rounded-[1rem] self-center`} />
    </div>
  )
}

interface LabeledStatusIndicatorProps {
  label: string;
  dotColor: string;
}
function LabeledStatusIndicator(props: LabeledStatusIndicatorProps) {
  return (
    <div className="w-full flex flex-row justify-center content-center">
      <BlinkDot color={props.dotColor} />
      <Text className="uppercase font-bold text-center text-xs self-center">
        {props.label}
      </Text>
    </div>
  )
}
export function WifiInfoCard(props: WifiInfoCardProps) {
  const wifiInfo = useWifiInfo();

  return (
    <div className="box-border flex flex-col w-3/11">
      <div className="grid grid-flow-row-dense grid-cols-2 gap-0">
        <div className="col-span-2 row-span-1 flex flex-row place-items-center mb-2">
          <LabeledStatusIndicator
            dotColor="bg-lime-300"
            label="UDP Socket" />
          <LabeledStatusIndicator
            dotColor="bg-red-300"
            label="Forza Data" />
        </div>
        <GridCell>
          <Text className="text-center uppercase font-bold text-xs ">Ip Address</Text>
        </GridCell>
        <GridCell>
          <Text className="text-center uppercase font-bold text-xs">Port</Text>
        </GridCell>
        <GridCell>
          <Text className="text-center text-xs">{wifiInfo.info?.ip}</Text>
        </GridCell>
        <GridCell>
          <Text className="text-center text-xs">{wifiInfo.info?.listenPort}</Text>
        </GridCell>
      </div>
    </div>
  )
}