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
  },
  charts: {
    line: {
      axisLine: string;
      tick: string;
      valueLabel: string;
      background: string;
      indicator: string;
    },
    leftFrontColor: string;
    rightFrontColor: string;
    leftRearColor: string;
    rightRearColor: string;
    yawColor: string;
    pitchColor: string;
    rollColor: string;
  },
  dataStatus: {
    connected: string;
    disconnected: string;
  }
  background: {
    primary: string;
    secondary: string;
    cardSeparator: string;
    trackMap: string;
    tabs: {
      background: string;
      indicator: string;
      hover: string;
    }
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
  charts: {
    line: {
      tick: 'rgb(92, 157, 203)',
      valueLabel: 'rgb(92, 157, 203)',
      axisLine: 'rgb(92, 157, 203)',
      background: 'rgba(0,0,0,0.4)',
      indicator: 'rgb(198, 219, 237)'
    },
    leftFrontColor: 'rgb(2, 178,175)',
    rightFrontColor: 'rgb(46,150,255)',
    leftRearColor: 'rgb(2, 91, 89)',
    rightRearColor: 'rgb(3, 85, 148)',
    yawColor: 'rgb(0, 163, 54)',
    pitchColor: 'rgb(103, 0, 207)',
    rollColor: 'rgb(0, 70, 209)'
  },
  background: {
    primary: "bg-sky-200 dark:bg-slate-950",
    secondary: "bg-sky-600 dark:bg-slate-700",
    cardSeparator: "bg-sky-600 dark:bg-sky-600/50",
    trackMap: "bg-sky-200/50 dark:bg-slate-950/50",
    tabs: {
      background: "bg-sky-650 dark:bg-slate-600",
      indicator: "bg-sky-700 dark:bg-sky-600",
      hover: "hover:bg-sky-700 hover:dark:bg-sky-600"
    }
  },
  dataStatus: {
    connected: 'bg-lime-300',
    disconnected: 'bg-red-300'
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