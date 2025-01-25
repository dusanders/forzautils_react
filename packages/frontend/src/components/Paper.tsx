import React, { ComponentPropsWithoutRef } from "react";
import { useTheme } from "../context/Theme";

export interface PaperProps extends ComponentPropsWithoutRef<'div'> {
  // Nothing - just type the prop
}

export function Paper(props: PaperProps) {
  const theme = useTheme();
  return (
    <div className="relative m-8">
      <div className={`absolute rounded-lg ${theme.colors.background.secondary} opacity-93 h-full w-full z-[-1]`}/>
      <div className="p-6">
      {props.children}
      </div>
    </div>
  )
}