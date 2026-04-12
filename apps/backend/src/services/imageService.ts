import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ImageRepository } from '@image-upload/db';
import {
  API_MESSAGES,
  API_MESSAGE_CODES,
  type CreateImageMetadataRequest,
  type CreatePresignedUrlRequest,
  DOMAIN_ERROR_MESSAGES,
  type ImageUrlInfo,
  MAX_UPLOAD_COUNT,
  PRESIGNED_URL_EXPIRY,
  type PresignedUrlInfo,
  type S3PresignMode,
  type S3ValidationMode,
  S3_PRESIGN_MODES,
  S3_VALIDATION_MODES,
  validateFileMagicNumber,
  validateFileName,
} from '@image-upload/domain';

const getEnv = (key: string): string | undefined => {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env?.[key];
};

const requireEnv = (key: string): string => {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
};

/**
 * 画像アップロードのユースケースを実装するサービスクラス
 * S3との連携・Presigned URL生成・メタデータ管理など、
 * APIレイヤーとインフラ（S3/DB）の橋渡し役を担う
 */
export class ImageService {
  private s3Client: S3Client;
  private bucketName: string;
  private s3ValidationMode: S3ValidationMode;
  private s3PresignMode: S3PresignMode;

  constructor() {
    const awsRegion = requireEnv('AWS_REGION');

    this.s3Client = new S3Client({
      region: awsRegion,
    });
    this.bucketName = getEnv('S3_BUCKET_NAME') || 'image-upload-bucket';
    this.s3ValidationMode =
      getEnv('S3_VALIDATION_MODE') === S3_VALIDATION_MODES.skip ? S3_VALIDATION_MODES.skip : S3_VALIDATION_MODES.strict;
    this.s3PresignMode =
      getEnv('S3_PRESIGN_MODE') === S3_PRESIGN_MODES.mock ? S3_PRESIGN_MODES.mock : S3_PRESIGN_MODES.aws;
  }

  /**
   * api001-upload: 署名付きURL発行
   * クライアントがS3に直接アップロードするためのPresigned URLを生成する
   * アップロード上限チェックとファイル名検証もここで行う
   * @param request - ファイル名・サイズ・Content-Typeを含むリクエスト
   * @param traceId - トレーサビリティのためのトレースID
   * @returns アップロード先URL（uploadUrl）とS3オブジェクトキー（key）
   * @throws アップロード枚数が上限に達した場合、またはファイル名が不正な場合
   */
  async createPresignedUrl(request: CreatePresignedUrlRequest, traceId: string): Promise<PresignedUrlInfo> {
    // アップロード枚数上限チェック
    const repository = new ImageRepository((await import('@image-upload/db')).prisma);
    const currentCount = await repository.count();

    if (currentCount >= MAX_UPLOAD_COUNT) {
      throw new Error(API_MESSAGES[API_MESSAGE_CODES.UPLOAD_LIMIT_EXCEEDED](MAX_UPLOAD_COUNT));
    }

    // ファイル名の安全性検証
    if (!validateFileName(request.fileName)) {
      throw new Error(DOMAIN_ERROR_MESSAGES.INVALID_FILE_NAME);
    }

    // S3オブジェクトキーの生成
    const key = this.generateS3Key(request.fileName, traceId);

    if (this.s3PresignMode === S3_PRESIGN_MODES.mock) {
      return {
        uploadUrl: `http://localhost:4566/mock-upload/${encodeURIComponent(key)}`,
        key,
      };
    }

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
   * S3へのアップロード完了後にマジックナンバー検証を行い、
   * 正当なファイルのみDBに登録する
   * @param request - S3キー・ファイル名・サイズ・Content-Typeを含むリクエスト
   * @param traceId - トレーサビリティのためのトレースID
   * @returns 登録した画像のIDと閲覧用URL
   * @throws S3にファイルが存在しない場合、またはマジックナンバー検証が失敗した場合
   */
  async createImageMetadata(
    request: CreateImageMetadataRequest,
    traceId: string,
  ): Promise<{ id: string; url: string }> {
    const repository = new ImageRepository((await import('@image-upload/db')).prisma);

    if (this.s3ValidationMode === S3_VALIDATION_MODES.strict) {
      // S3ファイルの存在確認
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: request.key,
      });

      try {
        await this.s3Client.send(headCommand);
      } catch (error) {
        throw new Error(API_MESSAGES[API_MESSAGE_CODES.FILE_NOT_FOUND_ON_S3]);
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

      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const headerBuffer = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        headerBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      if (!validateFileMagicNumber(headerBuffer.buffer, request.contentType)) {
        // マジックナンバー検証失敗時はS3ファイルを削除
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: request.key,
          }),
        );

        throw new Error(DOMAIN_ERROR_MESSAGES.INVALID_FILE_FORMAT);
      }
    }

    // メタデータをDBに保存
    const image = await repository.create({
      fileName: request.fileName,
      fileSize: request.fileSize,
      contentType: request.contentType,
      s3Key: request.key,
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
   * DBから全画像のメタデータを取得する
   * @param traceId - トレーサビリティのためのトレースID
   * @returns ID・ファイル名・作成日時の配列
   */
  async getImageList(traceId: string): Promise<{ id: string; fileName: string; createdAt: string }[]> {
    const repository = new ImageRepository((await import('@image-upload/db')).prisma);
    const images = await repository.findAll();

    return images.map((image) => ({
      id: image.id,
      fileName: image.fileName,
      createdAt: image.createdAt.toISOString(),
    }));
  }

  /**
   * api004-upload: 画像閲覧用URL取得
   * IDで画像を検索し、有効期限付きの閲覧用Presigned URLを返す
   * @param id - 取得する画像のID
   * @param traceId - トレーサビリティのためのトレースID
   * @returns 閲覧用URLと有効期限
   * @throws 指定したIDの画像が存在しない場合
   */
  async getImageUrl(id: string, traceId: string): Promise<ImageUrlInfo> {
    const repository = new ImageRepository((await import('@image-upload/db')).prisma);
    const image = await repository.findById(id);

    if (!image) {
      throw new Error(API_MESSAGES[API_MESSAGE_CODES.IMAGE_NOT_FOUND](id));
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
   * タイムスタンプとトレースIDを組み合わせて一意なキーを作る
   * @param fileName - 元のファイル名（英数字以外はアンダースコアに変換される）
   * @param traceId - トレーサビリティのためのトレースID
   * @returns `images/{timestamp}/{traceId}/{sanitizedFileName}` 形式のキー
   */
  private generateS3Key(fileName: string, traceId: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `images/${timestamp}/${traceId}/${sanitizedFileName}`;
  }

  /**
   * 閲覧用Presigned URLを生成する
   * @param s3Key - 対象のS3オブジェクトキー
   * @returns 有効期限付きの閲覧用URL
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
