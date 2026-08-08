import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'https://mkpl-e6jd52xojq-uc.a.run.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
