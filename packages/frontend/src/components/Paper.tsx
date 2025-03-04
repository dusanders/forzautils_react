import React, { ComponentPropsWithoutRef } from "react";
import { useTheme } from "../context/Theme";

export interface PaperProps {
  children?: any;
  rootClassName?: string;
  innerClassName?: string;
}

export function Paper(props: PaperProps) {
  const theme = useTheme();
  return (
    <div className={`relative m-2 rounded-lg shadow-xl dark:shadow-sky-400/20 ${props.rootClassName || ''}`}>
      <div className={`absolute rounded-lg backdrop-blur-xs h-full w-full z-[-1]`} />
      <div className={`absolute rounded-lg ${theme.colors.background.secondary} opacity-73 h-full w-full z-[-1]`} />
      <div className={`p-4 ${props.innerClassName || ''}`}>
        {props.children}
      </div>
    </div>
  )
}