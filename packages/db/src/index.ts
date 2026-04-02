import { PrismaClient } from '@prisma/client';

/**
 * PrismaClientのシングルトンインスタンス
 * アプリケーション全体で共有し、DB接続数の増加を防ぐ
 */
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// プロセス終了前にDB接続を安全にクローズする
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export * from './repositories/imageRepository';
