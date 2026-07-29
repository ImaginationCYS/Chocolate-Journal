import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Chocolate-Journal/',
  server: {
    port: 3721,
    host: true,
  },
})
