import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600
  },
  server: {
    open: true,
    host: true,
    fs: {
      allow: ['..']
    }
  }
})