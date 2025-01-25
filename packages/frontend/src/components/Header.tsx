import React from "react";
import { useWifiInfo } from "../hooks/useWifiInfo";
import { Text } from './Text';

export interface HeaderProps {

}

export function Header(props: HeaderProps) {
  const wifiInfo = useWifiInfo();
  return (
    <div className="w-full box-border">
      <Text className="m-4">
        Forward IP: {wifiInfo.info?.ip}
      </Text>
      <Text className="m-4">
        Forward Port: {wifiInfo.info?.listenPort}
      </Text>
    </div>
  )
}