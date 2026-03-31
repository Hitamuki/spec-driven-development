import {
  CreatePresignedUrlRequest,
  CreateImageMetadataRequest,
  PresignedUrlInfo,
  ImageUrlInfo,
  MAX_UPLOAD_COUNT,
  PRESIGNED_URL_EXPIRY,
  validateFileMagicNumber,
  validateFileName
} from '@image-upload/domain';
import { ImageRepository } from '@image-upload/db';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class ImageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME || 'image-upload-bucket';
  }

  /**
   * api001-upload: 署名付きURL発行
   */
  async createPresignedUrl(request: CreatePresignedUrlRequest, traceId: string): Promise<PresignedUrlInfo> {
    // アップロード枚数上限チェック
    const repository = new ImageRepository((await import('@image-upload/db')).prisma);
    const currentCount = await repository.count();

    if (currentCount >= MAX_UPLOAD_COUNT) {
      throw new Error(`アップロード枚数の上限（${MAX_UPLOAD_COUNT}枚）に達しています`);
    }

    // ファイル名の安全性検証
    if (!validateFileName(request.fileName)) {
      throw new Error('ファイル名が不正です');
    }

    // S3オブジェクトキーの生成
    const key = this.generateS3Key(request.fileName, traceId);

    // Presigned URLの生成
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: request.contentType,
      Metadata: {
        traceId,
        originalFileName: request.fileName,
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY.upload,
    });

    return {
      uploadUrl,
      key,
    };
  }

  /**
   * api002-upload: アップロード完了・メタデータ登録
   */
  async createImageMetadata(request: CreateImageMetadataRequest, traceId: string): Promise<{ id: string; url: string }> {
    const repository = new ImageRepository((await import('@image-upload/db')).prisma);

    // S3ファイルの存在確認
    const headCommand = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: request.key,
    });

    try {
      await this.s3Client.send(headCommand);
    } catch (error) {
      throw new Error('S3上にファイルが存在しません');
    }

    // マジックナンバー検証
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: request.key,
    });

    const response = await this.s3Client.send(getObjectCommand);
    const chunks: Uint8Array[] = [];

    // @ts-ignore - BodyはReadableStream
    for await (const chunk of response.Body) {
      chunks.push(chunk);
      // 先頭16バイトのみで十分なので、それ以上は読まない
      if (chunks.length >= 2) break;
    }

    const headerBuffer = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));

    if (!validateFileMagicNumber(headerBuffer.buffer, request.contentType)) {
      // マジックナンバー検証失敗時はS3ファイルを削除
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: request.key,
      }));

      throw new Error('ファイル形式が不正です');
    }

    // メタデータをDBに保存
    const image = await repository.create({
      fileName: request.fileName,
      fileSize: request.fileSize,
      contentType: request.contentType,
      s3Key: request.key,
      traceId,
    });

    // 閲覧用URLを生成
    const viewUrl = await this.generateViewUrl(request.key);

    return {
      id: image.id,
      url: viewUrl,
    };
  }

  /**
   * api003-upload: 画像一覧取得
   */
  async getImageList(traceId: string): Promise<{ id: string; fileName: string; createdAt: string }[]> {
    const repository = new ImageRepository((await import('@image-upload/db')).prisma);
    const images = await repository.findAll();

    return images.map(image => ({
      id: image.id,
      fileName: image.fileName,
      createdAt: image.createdAt.toISOString(),
    }));
  }

  /**
   * api004-upload: 画像閲覧用URL取得
   */
  async getImageUrl(id: string, traceId: string): Promise<ImageUrlInfo> {
    const repository = new ImageRepository((await import('@image-upload/db')).prisma);
    const image = await repository.findById(id);

    if (!image) {
      throw new Error('画像が存在しません');
    }

    const url = await this.generateViewUrl(image.s3Key);
    const expiresAt = new Date(Date.now() + PRESIGNED_URL_EXPIRY.view * 1000);

    return {
      url,
      expiresAt,
    };
  }

  /**
   * S3オブジェクトキーを生成する
   */
  private generateS3Key(fileName: string, traceId: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `images/${timestamp}/${traceId}/${sanitizedFileName}`;
  }

  /**
   * 閲覧用Presigned URLを生成する
   */
  private async generateViewUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY.view,
    });
  }
}
