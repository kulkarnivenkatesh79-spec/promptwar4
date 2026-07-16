import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  server: {
    proxy: {
      '/api/groq': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/groq/, '')
      }
    }
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('StadiumMap') || id.includes('HeatmapOverlay')) {
            return 'stadium-map';
          }
          if (id.includes('CrowdDashboard')) {
            return 'crowd-dashboard';
          }
          if (id.includes('IncidentReporter')) {
            return 'incident-reporter';
          }
          if (id.includes('EcoTracker')) {
            return 'eco-tracker';
          }
          if (id.includes('translations')) {
            return 'i18n-data';
          }
        }
      }
    }
  },
  esbuild: {
    legalComments: 'none'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/core/**', 'src/components/**']
    }
  }
});
