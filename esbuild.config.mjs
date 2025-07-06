import { build } from 'esbuild';

build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  target: 'es2018', // Screeps supports ES2018 well
  platform: 'node',
  format: 'cjs',
  outdir: 'dist',
  sourcemap: true,
  logLevel: 'info',
  minify: false,
}).catch(() => process.exit(1));
