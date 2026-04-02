/**
 * ドメインエンティティ定義
 */

/**
 * DBに永続化される画像エンティティ
 * S3オブジェクトキーとトレースIDを保持し、アップロード経路を追跡可能にする
 */
export interface Image {
  id: string;
  fileName: string;
  s3Key: string;
  fileSize: number;
  contentType: string;
  traceId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DB保存前に渡す画像メタデータ
 * IDや日時はDB側で生成するため含まない
 */
export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  contentType: string;
  s3Key: string;
  traceId: string;
}

/**
 * S3 Presigned URLの発行結果
 * uploadUrl に対してPUTリクエストすることで直接アップロードできる
 */
export interface PresignedUrlInfo {
  uploadUrl: string;
  key: string;
}

/**
 * 画像閲覧用の一時URLと有効期限
 * 有効期限切れ後は再取得が必要
 */
export interface ImageUrlInfo {
  url: string;
  expiresAt: Date;
}
