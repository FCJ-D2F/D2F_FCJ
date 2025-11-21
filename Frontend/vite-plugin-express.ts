import type { Plugin } from 'vite';
import type { Express } from 'express';

export function vitePluginExpress(createApp: () => Express): Plugin {
  return {
    name: 'vite-plugin-express',
    configureServer(server) {
      const app = createApp();
      
      // Add Express app as middleware
      server.middlewares.use((req, res, next) => {
        // Only handle /api routes
        if (req.url?.startsWith('/api')) {
          app(req as any, res as any, next);
        } else {
          next();
        }
      });
    },
  };
}


