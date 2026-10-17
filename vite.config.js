import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import productosUpload from './vite-plugin-productos-upload.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), productosUpload()],
})
