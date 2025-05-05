import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/RubiksCubeTester/", // For GitHub Pages deployment
  optimizeDeps: {
    exclude: [
      'src/logic/cubeConstants.ts' // Attempt to exclude from pre-bundling
    ]
  },
  server: {
    port: 5174,
    strictPort: true, // Optional: ensures Vite fails if port is in use
  }
}) 