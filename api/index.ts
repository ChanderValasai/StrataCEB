import type { IncomingMessage, ServerResponse } from 'http';
import { app } from '../src/server/app.ts';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(
    req as unknown as Parameters<typeof app>[0],
    res as unknown as Parameters<typeof app>[1]
  );
}
