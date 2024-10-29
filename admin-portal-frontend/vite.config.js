import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        headers: {
          // Add any required headers here or limit headers sent
          'X-Custom-Header': 'myCustomHeaderValue'
        }
      }
    }
  },
})
