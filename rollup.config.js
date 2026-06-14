import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/touch-action-scheduler-card.ts',
  output: {
    file: 'dist/touch-action-scheduler-card.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    resolve({
      browser: true,
      exportConditions: ['default', 'module', 'import', 'browser'],
    }),
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
};
