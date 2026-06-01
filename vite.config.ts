import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Phaser (~1.2 MB) and Three.js are known, irreducible vendor sizes; raise
    // the threshold above them to avoid a false-positive warning every build.
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      // Two entry points: the 2D platformer (index.html) and the 3D voxel
      // world (3d.html). Each loads only the engine it needs.
      input: {
        main: resolve(__dirname, 'index.html'),
        '3d': resolve(__dirname, '3d.html'),
      },
      output: {
        manualChunks: {
          phaser: ['phaser'],
          three: ['three'],
        },
      },
    },
  },
});
