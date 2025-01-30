import { useEffect } from 'react';
import './App.css';
import { WifiInfo } from './components/WifiInfo';
import { useForzaData } from './hooks/useForzaData';
import { BackgroundLogo } from './components/BackgroundLogo';
import { TrackMap } from './components/TrackMap';
import { EngineInfo } from './components/EngineInfo';

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
      <WifiInfo />
      <div className='flex flex-wrap'>
        <TrackMap />
        <EngineInfo />
      </div>
    </>
  )
}

export default App
