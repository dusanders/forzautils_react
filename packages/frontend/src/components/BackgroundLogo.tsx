import React from "react";
import { StaticAssets } from "../assets";
import { Color, Solver } from "../utility/Color";

export interface BackgroundLogoProps {

}

export function BackgroundLogo(props: BackgroundLogoProps) {
  const col = new Color(0, 0, 0);
  const solv = new Solver(col);
  const result = solv.solve();
  return (
    <div className="fixed h-full w-full place-content-center flex flex-col z-[-1]">
      <img
        src={StaticAssets.ForzaLogo}
        alt='Forza Logo'
        style={{
          filter: `${result.filter} drop-shadow(0px 0px 20px white)`,
          height: 'auto',
          width: '60%',
          placeSelf: 'center',
          opacity: '1'
        }} />
    </div>
  )
}