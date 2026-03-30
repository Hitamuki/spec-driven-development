/**
 * ドメインエンティティ定義
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

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  contentType: string;
  s3Key: string;
  traceId: string;
}

export interface PresignedUrlInfo {
  uploadUrl: string;
  key: string;
}

export interface ImageUrlInfo {
  url: string;
  expiresAt: Date;
}
