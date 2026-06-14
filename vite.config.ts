import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/touch-action-scheduler-card.ts'),
      name: 'TouchActionSchedulerCard',
      fileName: 'touch-action-scheduler-card',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    minify: false,
    sourcemap: true,
  },
});
