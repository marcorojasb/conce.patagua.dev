import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// En Vercel, api/stop-arrivals.ts corre como función. En `npm run dev` se monta
// el mismo handler como middleware, así el visor local funciona igual; lee
// TRANSAPP_PHONE_ID del entorno o de un .env.local (nunca commiteado).
function stopArrivalsApi(env: Record<string, string>): Plugin {
  return {
    name: 'stop-arrivals-api',
    configureServer(server) {
      // Asignar `undefined` a process.env lo convierte en el texto "undefined".
      if (!process.env.TRANSAPP_PHONE_ID && env.TRANSAPP_PHONE_ID) {
        process.env.TRANSAPP_PHONE_ID = env.TRANSAPP_PHONE_ID;
      }
      server.middlewares.use('/api/stop-arrivals', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/stop-arrivals.ts');
          const response: Response = await mod.GET(new Request(`http://localhost${req.originalUrl}`));
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (err) {
          res.statusCode = 500;
          res.end(String(err));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), stopArrivalsApi(loadEnv(mode, process.cwd(), ''))],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
