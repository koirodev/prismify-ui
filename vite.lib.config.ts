import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: 'tsconfig.build.json',
      insertTypesEntry: true,
      include: ['src/index.ts', 'src/components/**/*.vue', 'src/**/*.ts'],
      exclude: ['**/*.stories.ts', '**/*.spec.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PrismifyUI',
      fileName: 'prismify-ui',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: (id: string) => {
        if (
          id === 'vue' ||
          id === 'vue-router' ||
          id === '@internationalized/date' ||
          id === '@internationalized/number' ||
          id === '@tanstack/vue-table'
        ) {
          return true;
        }

        return id.startsWith('@tiptap/') || id.startsWith('prosemirror-');
      },
      output: {
        exports: 'named',
        assetFileNames: 'style.css',
        globals: {
          vue: 'Vue',
        },
      },
    },
    sourcemap: true,
  },
});
