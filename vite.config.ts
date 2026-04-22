import { defineConfig } from 'vite';

const isElectron = process.env.ELECTRON === '1';

export default defineConfig({
  base: isElectron ? './' : '/Englisch-2026-The-Last-Supper-/',
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 4096,
    sourcemap: false,
  },
  server: {
    host: true,
    port: 5173,
  },
});
