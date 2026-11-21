import type { IncomingMessage, ServerResponse } from 'http';

type ExpressApp = typeof import('../src/server/app.js').app;
let cachedApp: ExpressApp | null = null;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause instanceof Error && cause.message && cause.message !== error.message) {
      return `${error.message} — ${cause.message}`;
    }
    return error.message || 'Internal server error.';
  }
  return typeof error === 'string' && error.trim()
    ? error
    : 'Internal server error.';
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    if (!cachedApp) {
      const mod = await import('../src/server/app.js');
      cachedApp = mod.app;
    }
    const app = cachedApp;

    await new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      res.once('finish', done);
      res.once('close', done);
      res.once('error', (err) => {
        console.error('[Vercel Response Stream Error]', err);
        done();
      });

      const expressReq = req as unknown as Parameters<typeof app>[0];
      const expressRes = res as unknown as Parameters<typeof app>[1];

      app(expressReq, expressRes, (err?: unknown) => {
        if (err) {
          console.error('[Vercel Express Unhandled Error]', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: getErrorMessage(err),
              })
            );
          } else if (!res.writableEnded) {
            res.end();
          }
          done();
          return;
        }

        if (!res.headersSent) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: `API route not found: ${req.method ?? 'GET'} ${req.url ?? '/'}`,
            })
          );
          done();
        }
      });
    });
  } catch (error: unknown) {
    console.error('[Vercel Handler Fatal Error]', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: getErrorMessage(error),
        })
      );
    } else if (!res.writableEnded) {
      res.end();
    }
  }
}
