import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['@forzautils_react/core'],
  },
  build: {
    commonjsOptions: {
      include: ['@forzautils_react/core', /node_modules/],
    },
  },
  plugins: [react()],
})
