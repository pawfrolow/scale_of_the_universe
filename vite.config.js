import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  root: 'src',
  publicDir: 'assets',
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    open: true,
    host: true,
    fs: {
      allow: ['..']
    }
  }
})