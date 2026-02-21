import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'upload-audit': resolve(__dirname, 'src/pages/upload-audit.html'),
        'maison-3d': resolve(__dirname, 'maison-3d-thermique-interactive.html'),
      },
    },
  },
})
