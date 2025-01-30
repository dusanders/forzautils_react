import React from "react";
import { useTheme } from "../context/Theme";

export interface CardProps {
  rootClassName?: string;
  body: JSX.Element;
  title: JSX.Element;
}

export function Card(props: CardProps) {
  const theme = useTheme();
  return (
    <div className={`flex flex-col ${props.rootClassName || ''}`}>
      <div className="mb-2 p-2 place-content-center">
        {props.title}
      </div>
      <div className={`h-[1px] w-full ${theme.colors.background.cardSeparator}`} />
      <div className="mt-2 p-2 h-full w-full">
        {props.body}
      </div>
    </div>
  )
}