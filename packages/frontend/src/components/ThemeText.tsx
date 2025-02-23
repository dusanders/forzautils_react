import { ComponentPropsWithoutRef } from "react";
import { on_theme_variant, theme_variant, useTheme } from "../context/Theme";

export interface TextProps extends
  ComponentPropsWithoutRef<'p'>,
  ComponentPropsWithoutRef<'h1'>,
  ComponentPropsWithoutRef<'h2'> {
  element?: 'p' | 'h1' | 'h2';
  variant?: theme_variant;
  onVariant?: on_theme_variant;
}

export function ThemeText(props: TextProps) {
  const theme = useTheme();
  let color = theme.colors.text[
    props.variant ? props.variant : 'primary'
  ][
    props.onVariant ? props.onVariant : 'onPrimaryBg'
  ];
  switch (props.element) {
    case 'h1':
      return (
        <h1  {...props} className={`${color} cursor-default ${props.className}`}>
          {props.children}
        </h1>
      );
    case 'h2':
      return (
        <h2 {...props} className={`${color} cursor-default ${props.className}`}>
          {props.children}
        </h2>
      )
  }
  return (
    <p  {...props} className={`${color} cursor-default ${props.className}`}>
      {props.children}
    </p>
  )
}