import React, { ComponentPropsWithoutRef } from "react";
import { useTheme } from "../context/Theme";

export interface PaperProps extends ComponentPropsWithoutRef<'div'> {
  // Nothing - just type the prop
}

export function Paper(props: PaperProps) {
  const theme = useTheme();
  return (
    <div className={`rounded-lg ${theme.colors.background.secondary} m-8 p-4`}>
      {props.children}
    </div>
  )
}