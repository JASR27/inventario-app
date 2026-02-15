import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // Escucha en todas las interfaces locales
    hmr: {
      host: 'localhost', // Fuerza el WebSocket a conectar por localhost
    },
  },
})
