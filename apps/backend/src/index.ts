import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { imagesRoutes } from './routes/images';

const app = new Hono();

// ミドルウェア設定
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Trace-ID', 'X-Request-ID'],
}));

// ルート設定
app.route('/api/v1/images', imagesRoutes);

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
