import { PrismaClient } from '@prisma/client';

// PrismaClientのシングルトンインスタンス
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// グローバル例外ハンドリング
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export * from './repositories/imageRepository';
