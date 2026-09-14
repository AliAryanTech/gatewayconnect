import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// Vercel uses the serverless functions in /api for Paynow.
// Keep the Vite config browser/build-safe: no Node-only middleware here.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), '.'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
