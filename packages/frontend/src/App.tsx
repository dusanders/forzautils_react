import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  console.log(`loading WS`);
  const ws = new WebSocket('ws://127.0.0.1:81/connect');
  ws.onopen = (ev) => {
    console.log(`ws open`);
    ws.send(JSON.stringify({"type": "world"}))
  }
  ws.addEventListener('error', (ev) => {
    console.log(`error: ${ev}`, ev);
  });
  ws.onclose = (ev) => {
    console.log(`closed ${ev.code} ${ev.reason}`);
  }
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
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
