import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /pulse is its own HTML entry (outreach link: own meta tags, no
// homepage intro). Vercel maps the clean URL via vercel.json; this
// does the same for the dev server.
const pulseRoute = () => ({
  name: 'pulse-route',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/pulse' || req.url === '/pulse/' || req.url?.startsWith('/pulse?')) {
        req.url = req.url.replace(/^\/pulse\/?/, '/pulse.html');
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), pulseRoute()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pulse: resolve(__dirname, 'pulse.html'),
      },
    },
  },
});
