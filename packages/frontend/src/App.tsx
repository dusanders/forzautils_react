import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css';
import { useTheme } from './context/Theme';
import { Text } from './components/Text';
import { Header } from './components/Header';
import { useForzaData } from './hooks/useForzaData';
import { Paper } from './components/Paper';

function App() {
  const theme = useTheme();
  const [count, setCount] = useState(0);
  const forza = useForzaData();
  useEffect(() => {
    console.log(`new packet: ${forza.packet?.data.rpmData.current}`);
  }, [forza.packet]);
  return (
    <>
      <Header />
      <Paper>
        <Text>
          Test
        </Text>
        <Text variant={'secondary'} onVariant={'onSecondaryBg'}>
          World
        </Text>
      </Paper>
      <div className={`flex justify-center rounded-lg ${theme.colors.background.secondary}`}>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <Text element='h2'>
          Hello world
        </Text>
      </div>
      <Text element={'h1'}>
        Vite + React
      </Text>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
