import React from "react";
import { ThemeText } from "./ThemeText";

export interface CardTitleProps {
  title: string;
}

export function CardTitle(props: CardTitleProps) {
  return (
    <ThemeText element='h2' className='font-bold uppercase opacity-60'>
      {props.title}
    </ThemeText>
  )
}