import React from "react";
import { useWifiInfo } from "../hooks/useWifiInfo";
import { Text } from './Text';
import { useTheme } from "../context/Theme";
import { useForzaData } from "../context/ForzaContext";

export interface WifiInfoProps {

}

function Container(props: { children: any }) {
  return (
    <div className="flex flex-col m-2">
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
    <div className="w-full flex flex-row">
      <BlinkDot color={props.dotColor} />
      <Text className="uppercase font-bold text-center text-xs self-center">
        {props.label}
      </Text>
    </div>
  )
}
export function WifiInfo(props: WifiInfoProps) {
  const theme = useTheme();
  const wifiInfo = useWifiInfo();
  const forzaData = useForzaData();
  return (
    <div className="box-border flex flex-wrap p-2">
      <Container>
        <LabeledStatusIndicator
          dotColor={forzaData.isWebsocketOpen
            ? theme.colors.dataStatus.connected
            : theme.colors.dataStatus.disconnected
          }
          label="UDP Socket" />
        <LabeledStatusIndicator
          dotColor={forzaData.packet?.data.isRaceOn
            ? theme.colors.dataStatus.connected
            : theme.colors.dataStatus.disconnected
          }
          label="Forza Data" />
      </Container>
      <div className="flex flex-wrap">
        <Container>
          <Text className="text-center uppercase font-bold text-xs ">Ip Address</Text>
          <Text className="text-center text-xs">{wifiInfo.info?.ip}</Text>
        </Container>
        <Container>
          <Text className="text-center uppercase font-bold text-xs">Port</Text>
          <Text className="text-center text-xs">{wifiInfo.info?.listenPort}</Text>
        </Container>
      </div>
    </div>
  )
}