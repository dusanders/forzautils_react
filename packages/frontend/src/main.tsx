import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/Theme.tsx'
import { ForzaContext } from './context/ForzaContext.tsx'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    {theme => (
      <ForzaContext>
        {forza => (
          <App />
        )}
      </ForzaContext>
    )}
  </ThemeProvider>
)
