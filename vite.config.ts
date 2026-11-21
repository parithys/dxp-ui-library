import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import pkg from './package.json' with { type: 'json' };

// Library mode: one entry (src/index.ts), ESM + CJS. Peer and runtime dependencies stay external, so the consumer's bundler dedupes them.
const external = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)].map((d) => new RegExp(`^${d}(/.*)?$`));
export default defineConfig({
  plugins: [react()],
  
  build: {
    lib: { entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)), formats: ['es', 'cjs'], fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs') },
    rollupOptions: { external: [...external, /^react\/jsx-runtime$/], output: { preserveModules: false } },
    sourcemap: true,
    emptyOutDir: true,
  },
});
