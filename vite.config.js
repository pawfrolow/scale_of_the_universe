import { resolve } from 'path';

import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: './',
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    tsconfigPaths(),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
  },
  server: {
    open: true,
    host: true,
    fs: {
      allow: ['..'],
    },
  },
});
