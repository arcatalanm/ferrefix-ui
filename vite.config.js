import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import productosUpload from "./vite-plugin-productos-upload.js"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), productosUpload()],
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/data/**", "src/components/**", "src/pages/**"],
      exclude: ["src/main.jsx", "src/App.jsx"]
    }
  },
})
