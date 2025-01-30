import React, { useCallback, useEffect, useState } from "react";

export interface IScreenDimensions {
  dimensions: WindowSize;
}
export interface WindowSize {
  innerHeight: number;
  innerWidth: number;
}
export function useScreenDimensions(): IScreenDimensions {
  const [size, setSize] = useState<WindowSize>({
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth
  });

  useEffect(() => {
    const resizeHandler = (ev: UIEvent) => {
      setSize({
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth
      });
    };
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    }
  });
  return {
    dimensions: size
  }
}