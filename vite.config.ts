// vite.config.ts

import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Aumentar limite de chunk size
    chunkSizeWarningLimit: 1000,
    // Usar minificador padrão do Vite (esbuild) ao invés do Terser
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Separar chunks para otimizar carregamento
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-toast', '@radix-ui/react-label', '@radix-ui/react-slot'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'appwrite-vendor': ['appwrite'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'uuid', 'class-variance-authority'],
        }
      }
    }
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'appwrite'
    ]
  }
})