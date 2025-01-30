import React from "react";
import { Text } from "./Text";

export interface CardTitleProps {
  title: string;
}

export function CardTitle(props: CardTitleProps) {
  return (
    <Text element='h2' className='font-bold uppercase opacity-60'>
      {props.title}
    </Text>
  )
}