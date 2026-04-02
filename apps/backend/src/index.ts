import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { imagesRoutes } from './routes/images';

/**
 * Honoアプリケーションインスタンス
 * ミドルウェアとルートを登録し、Bunサーバーに渡す
 */
const app = new Hono();

const port = Number(process.env.PORT) || 3001;

// ミドルウェア設定
app.use('*', logger());
app.use('*', cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // 本番 or preview
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Trace-ID', 'X-Request-ID'],
}));

// ルート設定
app.route('/api/v1/images', imagesRoutes);

/**
 * ヘルスチェックエンドポイント
 * ロードバランサーやモニタリングツールがサーバーの稼働を確認するために使用する
 */
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log(`🚀 Backend server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
