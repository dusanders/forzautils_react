import { useEffect, useState } from 'react';
import './App.css';
import { useTheme } from './context/Theme';
import { Text } from './components/Text';
import { WifiInfoCard } from './components/WifiInfoCard';
import { useForzaData } from './hooks/useForzaData';
import { Paper } from './components/Paper';
import { StaticAssets } from './assets';
import { Color, Solver } from './utility/Color';
import { BackgroundLogo } from './components/BackgroundLogo';

function App() {
  const theme = useTheme();
  const [count, setCount] = useState(0);
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
      <Paper>
      <WifiInfoCard />
      </Paper>
    </>
  )
}

export default App
