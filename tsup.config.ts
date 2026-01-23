import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Bundle everything into a single file
  splitting: false,
  // Bundle @opencode-ai/plugin since it has ESM resolution issues
  noExternal: ['@opencode-ai/plugin'],
  // Ensure proper handling of ESM/CJS interop
  shims: true,
});
