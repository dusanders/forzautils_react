import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css';
import { ForzaWebsocket, WifiInfoDto } from '@forzautils/core';
import { useTheme } from './context/Theme';
import { Text } from './components/Text';

function App() {
  const theme = useTheme();
  const [count, setCount] = useState(0);
  console.log(`loading WS`);
  const ws = new ForzaWebsocket();
  ws.on('open', () => {
    console.log(`Forza socket open`);
  });
  ws.start();
  const ip: WifiInfoDto = {
    ip: '',
    listenPort: 0
  }
  return (
    <>
    
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
