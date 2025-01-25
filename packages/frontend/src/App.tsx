import { useEffect, useState } from 'react';
import './App.css';
import { Text } from './components/Text';
import { WifiInfo } from './components/WifiInfo';
import { useForzaData } from './hooks/useForzaData';
import { BackgroundLogo } from './components/BackgroundLogo';
import { Paper } from './components/Paper';
import { Card } from './components/Card';
import { TrackMap } from './components/TrackMap';

function App() {
  const forza = useForzaData();
  useEffect(() => {
    if (!forza.packet?.data.isRaceOn) {
      return;
    }
    console.log(`new packet: ${forza.packet?.data.rpmData.current}`);
  }, [forza.packet]);

  return (
    <>
      <BackgroundLogo />
      <div>
        <WifiInfo />
      </div>
      <TrackMap />
    </>
  )
}

export default App
