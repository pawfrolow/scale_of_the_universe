import { createRequire } from 'node:module';

import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default defineConfig({
  output: 'static',
  outDir: 'dist',
  publicDir: 'public',
  integrations: [react()],
  vite: {
    plugins: [tsconfigPaths()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      chunkSizeWarningLimit: 1600,
    },
    environments: {
      client: {
        build: {
          rollupOptions: {
            output: {
              manualChunks(id) {
                if (!id.includes('node_modules')) {
                  return undefined;
                }

                if (id.includes('pixi.js-legacy') || id.includes('pixi-filters')) {
                  return 'pixi';
                }

                return undefined;
              },
            },
          },
        },
      },
    },
  },
  server: {
    host: true,
    port: 5174,
  },
});
