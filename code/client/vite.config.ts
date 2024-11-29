import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: process.env.DOCKER ? '0.0.0.0' : 'localhost', // Accetta connessioni esterne
    port: 5173,      // Porta del server di sviluppo
  },
  plugins: [react()],
})