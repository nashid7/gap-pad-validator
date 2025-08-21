import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // This exposes the server to all network interfaces
    port: 3000,       // Try port 3000 first
    strictPort: false, // Allow Vite to try other ports if 3000 is unavailable
    open: true        // Opens the browser automatically
  }
})
