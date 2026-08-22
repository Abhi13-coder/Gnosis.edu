import { defineConfig } from 'vite';

// Repo name is "Gnosis.edu", served at https://abhi13-coder.github.io/Gnosis.edu/
// so every built asset URL must be prefixed with this base path.
export default defineConfig({
  base: '/Gnosis.edu/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
