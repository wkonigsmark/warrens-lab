import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deploys as its own Vercel app at a root domain (like ants-axes.vercel.app),
// so the default base "/" is correct — no subpath handling needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9008,
    strictPort: true,
    open: true,
  },
})
