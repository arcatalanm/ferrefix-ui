import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/media': 'http://localhost:8080', '/api': 'http://localhost:8080' },
  },
  preview: {
    proxy: { '/media': 'http://localhost:8080', '/api': 'http://localhost:8080' },
  },
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
