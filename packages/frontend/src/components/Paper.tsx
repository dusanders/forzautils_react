import React, { ComponentPropsWithoutRef } from "react";
import { useTheme } from "../context/Theme";

export interface PaperProps {
  children?: any;
  rootClassName?: string;
}

export function Paper(props: PaperProps) {
  const theme = useTheme();
  return (
    <div className={`relative m-8 rounded-lg shadow-xl dark:shadow-sky-400/20 ${props.rootClassName || ''}`}>
      <div className={`absolute rounded-lg ${theme.colors.background.secondary} opacity-73 h-full w-full z-[-1]`} />
      <div className="p-4">
        {props.children}
      </div>
    </div>
  )
}