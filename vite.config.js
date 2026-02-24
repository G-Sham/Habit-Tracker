import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://lead-tracker-vbpoy.web.app',
      dynamicRoutes: ['/analysis', '/profile']
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        tracker: 'tracker.html'
      },
      output: {
        manualChunks: {
          // This grouping helps with the 1MB bundle size issue mentioned in your audit
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'recharts-vendor': ['recharts'],
          'date-fns-vendor': ['date-fns']
        }
      }
    }
  }
});