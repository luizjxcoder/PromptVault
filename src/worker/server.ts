import { serve } from '@hono/node-server';
import app from './local-dev';

const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 Starting local development server on port ${port}`);
serve({
  fetch: app.fetch,
  port
});
