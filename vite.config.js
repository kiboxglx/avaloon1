import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/apify': {
        target: 'https://api.apify.com/v2',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/apify/, '')
      }
    }
  }
})
