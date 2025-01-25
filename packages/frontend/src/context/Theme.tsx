import { createContext, useContext } from "react";

export type theme_variant = 'primary' | 'secondary';
export type on_theme_variant = 'onPrimaryBg' | 'onSecondaryBg';

export interface IColorElements {
  text: {
    primary: {
      onPrimaryBg: string;
      onSecondaryBg: string;
    }
    secondary: {
      onPrimaryBg: string;
      onSecondaryBg: string;
    }
  }
  background: {
    primary: string;
    secondary: string;
  }
}

const themecolors: IColorElements = {
  text: {
    primary: {
      onPrimaryBg: "text-blue-900 dark:text-sky-200",
      onSecondaryBg: "text-blue-600 dark:text-sky-400"
    },
    secondary: {
      onPrimaryBg: "text-slate-600 dark:text-slate-400",
      onSecondaryBg: "text-slate-600 dark:text-slate-400"
    }
  },
  background: {
    primary: "bg-sky-200 dark:bg-slate-900",
    secondary: "bg-sky-600 dark:bg-slate-700"
  }
}

export interface ITheme {
  colors: IColorElements;
}

export interface ThemeProviderProps {
  children: (themeConsumer: ITheme) => React.ReactElement | React.ReactElement[]
}

const theme_context = createContext({} as ITheme);

export function ThemeProvider(props: ThemeProviderProps) {
  const body = document.getElementsByTagName('body');
  if(body) {
    body[0].className = `${themecolors.background.primary}`
  }
  return (
    <theme_context.Provider value={{
      colors: themecolors
    }}>
      <theme_context.Consumer>
        {consumer => props.children(consumer)}
      </theme_context.Consumer>
    </theme_context.Provider>
  )
}

export function useTheme(): ITheme {
  return useContext(theme_context);
}