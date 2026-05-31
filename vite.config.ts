import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // The Phaser engine is ~1.2 MB in a single module — a known, irreducible
    // vendor size. Our app chunk stays ~10 KB, so raise the warning threshold
    // above the engine size to avoid a false-positive warning on every build.
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        // Split the Phaser engine into its own long-cacheable chunk so the
        // app bundle stays small and the chunk-size warning goes away.
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
});
