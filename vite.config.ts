import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// En Vercel, api/stop-arrivals.ts y api/route-vehicles.ts corren como
// funciones. En `npm run dev` se montan los mismos handlers como middleware,
// así el visor local funciona igual; leen TRANSAPP_PHONE_ID del entorno o de un
// .env.local (nunca commiteado).
const API_HANDLERS = ['stop-arrivals', 'route-vehicles'];

function liveApi(env: Record<string, string>): Plugin {
  return {
    name: 'live-api',
    configureServer(server) {
      // Asignar `undefined` a process.env lo convierte en el texto "undefined".
      if (!process.env.TRANSAPP_PHONE_ID && env.TRANSAPP_PHONE_ID) {
        process.env.TRANSAPP_PHONE_ID = env.TRANSAPP_PHONE_ID;
      }
      for (const name of API_HANDLERS) {
        server.middlewares.use(`/api/${name}`, async (req, res) => {
          // Como en Vercel, que solo expone el GET que exporta cada handler.
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.setHeader('allow', 'GET');
            res.end();
            return;
          }
          try {
            const mod = await server.ssrLoadModule(`/api/${name}.ts`);
            const response: Response = await mod.GET(new Request(`http://localhost${req.originalUrl}`));
            res.statusCode = response.status;
            response.headers.forEach((value, key) => res.setHeader(key, value));
            res.end(await response.text());
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err));
          }
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), liveApi(loadEnv(mode, process.cwd(), ''))],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
