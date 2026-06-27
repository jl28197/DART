// vite.config.js
// The proxy setting means any request from React to /api/...
// gets automatically forwarded to your FastAPI server.
// This way your React code never hardcodes localhost:8000 —
// it just calls /api/simulate and Vite handles the routing.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})