import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'path';

import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import pkg from './package.json';

const compactJsonAssets = () => {
  let outDir;

  const minifyJsonFiles = async (directoryPath) => {
    const entries = await readdir(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = resolve(directoryPath, entry.name);

      if (entry.isDirectory()) {
        await minifyJsonFiles(entryPath);
        continue;
      }

      if (!entry.isFile() || !/\.(json|webmanifest)$/u.test(entry.name)) {
        continue;
      }

      const source = await readFile(entryPath, 'utf8');

      try {
        const compactJson = `${JSON.stringify(JSON.parse(source))}\n`;

        if (source !== compactJson) {
          await writeFile(entryPath, compactJson);
        }
      } catch {
        // Skip files that are not valid JSON.
      }
    }
  };

  return {
    name: 'compact-json-assets',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await minifyJsonFiles(outDir);
    },
  };
};

export default defineConfig({
  base: '/',
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    tsconfigPaths(),
    compactJsonAssets(),
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
    port: 5174,
    strictPort: false,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
