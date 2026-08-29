import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { pathToFileURL } from 'url';

function apiDevMiddleware() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/gerar-plano') && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            try {
              let body = {};
              if (bodyStr) {
                try {
                  body = JSON.parse(bodyStr);
                } catch {
                  body = {};
                }
              }

              // Import dinâmico da serverless function com caminho absoluto
              const absolutePath = path.resolve(process.cwd(), 'api', 'gerar-plano.js');
              const fileUrl = pathToFileURL(absolutePath).href + '?t=' + Date.now();
              const { default: handler } = await import(fileUrl);

              const mockReq = {
                method: req.method,
                url: req.url,
                body,
                headers: req.headers
              };

              const mockRes = {
                statusCode: 200,
                headers: {},
                setHeader(name, val) {
                  this.headers[name] = val;
                  res.setHeader(name, val);
                },
                status(code) {
                  this.statusCode = code;
                  res.statusCode = code;
                  return this;
                },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = this.statusCode;
                  res.end(JSON.stringify(data));
                }
              };

              await handler(mockReq, mockRes);
            } catch (err) {
              console.error('Erro no middleware Vite /api/gerar-plano:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = env.GOOGLE_API_KEY;
  }

  return {
    plugins: [react(), apiDevMiddleware()]
  };
});
