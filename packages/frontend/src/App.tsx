import { useEffect } from 'react';
import './App.css';
import { WifiInfo } from './components/WifiInfo';
import { BackgroundLogo } from './components/BackgroundLogo';
import { TrackMap } from './components/TrackMap';
import { EngineInfo } from './components/EngineInfo';
import { Suspension } from './components/Suspension';
import { useForzaData } from './context/ForzaContext';
import { TireInfo } from './components/TireInfo';
import { useRecorder } from './hooks/useRecorder';
import { Paper } from './components/Paper';
import { Card } from './components/Card';
import { CardTitle } from './components/CardTitle';

function App() {
  const forza = useForzaData();
  useEffect(() => {
    if (!forza.packet?.data.isRaceOn) {
      return;
    }
  }, [forza.packet]);
  const recorder = useRecorder();

  return (
    <>
      <BackgroundLogo />
      <WifiInfo />
      <Paper innerClassName='flex flex-wrap justify-evenly'>
        <TrackMap />
        <EngineInfo />
        <Suspension />
        <TireInfo />
      </Paper>
    </>
  )
}

export default App
