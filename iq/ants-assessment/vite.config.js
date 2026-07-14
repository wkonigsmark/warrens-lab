import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9011,
    strictPort: true,
    open: true,
    fs: { allow: ['..'] } // lets the dev server serve ../_shared/progress
  }
})
