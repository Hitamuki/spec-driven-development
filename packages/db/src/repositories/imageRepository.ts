import { PrismaClient } from '@prisma/client';
import { Image, ImageMetadata } from '@image-upload/domain';

/**
 * 画像データのCRUD操作を担うリポジトリクラス
 * DB操作を抽象化し、ドメイン層がPrismaに直接依存しないようにする
 */
export class ImageRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * 画像メタデータをDBに保存する
   * @param data - 保存する画像メタデータ
   * @returns 保存後の画像エンティティ（ID・日時含む）
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
   * すべての画像を新しい順で取得する
   * @returns 画像エンティティの配列（createdAt降順）
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
   * @param id - 検索対象の画像ID
   * @returns 画像エンティティ、存在しない場合は `null`
   */
  async findById(id: string): Promise<Image | null> {
    return this.prisma.image.findUnique({
      where: { id },
    });
  }

  /**
   * S3キーで画像を取得する
   * @param s3Key - 検索対象のS3オブジェクトキー
   * @returns 画像エンティティ、存在しない場合は `null`
   */
  async findByS3Key(s3Key: string): Promise<Image | null> {
    return this.prisma.image.findUnique({
      where: { s3Key },
    });
  }

  /**
   * DBに保存された画像の総数を取得する
   * アップロード上限チェックに使用する
   * @returns 画像の総件数
   */
  async count(): Promise<number> {
    return this.prisma.image.count();
  }

  /**
   * IDで画像を削除する
   * @param id - 削除対象の画像ID
   */
  async delete(id: string): Promise<void> {
    await this.prisma.image.delete({
      where: { id },
    });
  }
}
