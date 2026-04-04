import { z } from 'zod';

/**
 * 環境変数のスキーマ定義
 * 起動時にZodでバリデーションし、型安全なアクセスを保証する
 * 必須変数が未設定の場合はプロセスが起動しない（Fail Fast）
 */
const envSchema = z.object({
  // データベース
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // AWS S3
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  S3_BUCKET_NAME: z.string().min(1, 'S3_BUCKET_NAME is required'),

  // アプリケーション
  PORT: z.string().transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ロギング
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // レート制限
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'), // 1分
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('10'),
});

const runtime = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

/**
 * バリデーション済みの環境変数オブジェクト
 * 型安全に環境変数へアクセスするために使用する
 */
export const env = envSchema.parse(runtime.process?.env ?? {});

/**
 * アプリケーション設定オブジェクト
 * env をラップし、意味のある名前でグルーピングしたアクセスポイントを提供する
 */
export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  database: {
    url: env.DATABASE_URL,
  },

  aws: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: env.S3_BUCKET_NAME,
  },

  logging: {
    level: env.LOG_LEVEL,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
} as const;
