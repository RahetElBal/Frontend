import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Heavy calendar libs -- only loaded by agenda page (lazy)
          if (id.includes('react-big-calendar')) return 'vendor-calendar';
          if (id.includes('moment')) return 'vendor-moment';

          // React core + router -- shared by everything
          if (id.includes('react-dom')) return 'vendor-react';
          if (id.includes('react-router')) return 'vendor-router';

          // UI primitives
          if (id.includes('@radix-ui')) return 'vendor-radix';

          // Data layer
          if (id.includes('@tanstack')) return 'vendor-query';

          // Forms
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'vendor-forms';
          }

          // i18n
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'vendor-i18n';
          }

          // Icons -- tree-shaken but still sizeable
          if (id.includes('lucide-react')) return 'vendor-icons';

          // Phone validation -- only used in a few forms
          if (id.includes('libphonenumber-js')) return 'vendor-phone';

          // HTTP client
          if (id.includes('ky')) return 'vendor-http';

          // Everything else
          return 'vendor';
        },
      },
    },
  },
})
