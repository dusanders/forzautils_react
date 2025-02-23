import { useEffect } from 'react';
import './App.css';
import { WifiInfo } from './components/WifiInfo';
import { BackgroundLogo } from './components/BackgroundLogo';
import { TrackMap } from './components/TrackMap';
import { EngineInfo } from './components/EngineInfo/EngineInfo';
import { Suspension } from './components/Suspension';
import { ForzaContext, useForzaData } from './context/ForzaContext';
import { TireInfo } from './components/TireInfo';
import { useRecorder } from './hooks/useRecorder';
import { Paper } from './components/Paper';
import { Card } from './components/Card';
import { CardTitle } from './components/CardTitle';
import { CarCornerInfo } from './components/CarCornerInfo';

function App() {
  const recorder = useRecorder();

  return (
    <ForzaContext>
      {forza => (
        <>
          <BackgroundLogo />
          <WifiInfo />
          <Paper innerClassName='flex flex-wrap justify-evenly'>
            <TrackMap />
            <EngineInfo />
            <Suspension />
            <TireInfo />
            <div className='flex flex-row justify-between w-full'>
              <CarCornerInfo position='leftFront' />
              <CarCornerInfo position='rightFront' />
            </div>
            <div className='flex flex-row justify-between w-full'>
              <CarCornerInfo position='leftRear' />
              <CarCornerInfo position='rightRear' />
            </div>
          </Paper>
        </>
      )}
    </ForzaContext>
  )
}

export default App
