import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Don't treat Quasar components as custom elements - let Vue handle them
          // isCustomElement: (tag) => tag.startsWith('q-'),
        },
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/dist/**',
        '**/*.d.ts',
        'src/boot/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      'components': fileURLToPath(new URL('./src/components', import.meta.url)),
      'pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
    },
  },
})
