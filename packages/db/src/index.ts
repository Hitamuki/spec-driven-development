import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const runtime = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

const databaseUrl = runtime.process?.env?.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

/**
 * PrismaClientのシングルトンインスタンス
 * アプリケーション全体で共有し、DB接続数の増加を防ぐ
 */
export const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

// プロセス終了前にDB接続を安全にクローズする
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export * from './repositories/imageRepository';
