import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

function copyReadmeAndLlmsToDist(): Plugin {
  const readmeSrc = resolve(__dirname, 'README.md');
  const readmeDest = resolve(__dirname, 'dist/README.md');
  const llmsSrc = resolve(__dirname, 'llms.txt');
  const llmsDest = resolve(__dirname, 'dist/llms.txt');
  return {
    name: 'copy-readme-and-llms-to-dist',
    closeBundle() {
      copyFileSync(readmeSrc, readmeDest);
      copyFileSync(llmsSrc, llmsDest);
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    copyReadmeAndLlmsToDist(),
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
