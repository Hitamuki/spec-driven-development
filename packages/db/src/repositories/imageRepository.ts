import { PrismaClient } from '@prisma/client';
import { Image, ImageMetadata } from '@image-upload/domain';

export class ImageRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * 画像を保存する
   */
  async create(data: ImageMetadata): Promise<Image> {
    return this.prisma.image.create({
      data: {
        fileName: data.fileName,
        fileSize: data.fileSize,
        contentType: data.contentType,
        s3Key: data.s3Key,
        traceId: data.traceId,
      },
    });
  }

  /**
   * すべての画像を取得する
   */
  async findAll(): Promise<Image[]> {
    return this.prisma.image.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * IDで画像を取得する
   */
  async findById(id: string): Promise<Image | null> {
    return this.prisma.image.findUnique({
      where: { id },
    });
  }

  /**
   * S3キーで画像を取得する
   */
  async findByS3Key(s3Key: string): Promise<Image | null> {
    return this.prisma.image.findUnique({
      where: { s3Key },
    });
  }

  /**
   * 画像の総数を取得する
   */
  async count(): Promise<number> {
    return this.prisma.image.count();
  }

  /**
   * 画像を削除する
   */
  async delete(id: string): Promise<void> {
    await this.prisma.image.delete({
      where: { id },
    });
  }
}
