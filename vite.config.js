import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves a project site from /<repo-name>/, not the domain
  // root. Without this, every asset link 404s — this is what the old
  // repo's deploy setup was missing (no base, no CNAME, no homepage field).
  base: '/Faculty-Excellence-Platform-2026/',
})
