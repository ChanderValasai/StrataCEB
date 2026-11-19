import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { app, injectSeoIntoHtml } from './src/server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const port = Number(process.env.PORT || 3000);
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.get(['/', '/story', '/story/*', '/admin', '/admin/*'], async (req, res, next) => {
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        const template = await fs.promises.readFile(indexPath, 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, template);
        const seoHtml = await injectSeoIntoHtml(transformed, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(seoHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distDir, {
        index: false,
        maxAge: '7d',
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', async (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        const template = await fs.promises.readFile(indexFile, 'utf-8');
        const seoHtml = await injectSeoIntoHtml(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(seoHtml);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Lime Stone server running on port ${port}`);
  });
}

startServer();
