import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.dirname(fileURLToPath(import.meta.url));

/** Library bundle only — root `index.html` is copied verbatim in `scripts/copy-to-dist.mjs`. */
export default defineConfig({
  root,
  build: {
    lib: {
      entry: path.join(root, 'src/motion-ui.ts'),
      name: 'motionUi',
      fileName: () => 'motion-ui',
      formats: ['es'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'motion-ui.js',
      },
    },
  },
});
