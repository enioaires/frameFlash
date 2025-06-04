import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

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
          // App chunks
          'auth-pages': [
            './src/_auth/AuthLayout',
            './src/_auth/forms/SigninForm',
            './src/_auth/forms/SignupForm'
          ],
          'adventure-pages': [
            './src/_root/pages/adventures/AdventuresList',
            './src/_root/pages/adventures/AdventureManagement',
            './src/_root/pages/adventures/CreateAdventure',
            './src/_root/pages/adventures/EditAdventure'
          ]
        }
      }
    },
    // Otimizações adicionais
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
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