import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'builds/web',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
