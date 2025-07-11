import { build } from 'esbuild';

build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  target: 'es6', // Screeps supports ES2018 well
  platform: 'node',
  tsconfig: 'tsconfig.json',
  format: 'cjs',
  outdir: 'dist',
  sourcemap: true,
  logLevel: 'info',
  minify: false,
  keepNames: true, // optional: keeps function/class names
}).catch(() => process.exit(1));
