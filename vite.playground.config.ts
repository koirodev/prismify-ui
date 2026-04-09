import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

/** Local page for debugging components outside Storybook (`npm run playground`). */
export default defineConfig({
  root: resolve(__dirname, 'playground'),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
