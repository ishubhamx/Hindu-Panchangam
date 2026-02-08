import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ishubhamx/panchangam-js': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
})
