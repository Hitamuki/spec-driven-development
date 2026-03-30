import { z } from 'zod';

/**
 * 画像アップロードに関するスキーマ定義
 */

// api001-upload: 署名付きURL発行リクエスト
export const createPresignedUrlSchema = z.object({
  fileName: z.string().min(1, 'ファイル名は必須です'),
  fileSize: z.number().min(1, 'ファイルサイズは必須です').max(5 * 1024 * 1024, 'ファイルサイズは5MB以下である必要があります'),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], {
    errorMap: () => ({ message: '対応していないファイル形式です' })
  }),
});

// api002-upload: アップロード完了・メタデータ登録リクエスト
export const createImageMetadataSchema = z.object({
  key: z.string().min(1, 'S3オブジェクトキーは必須です'),
  fileName: z.string().min(1, 'ファイル名は必須です'),
  fileSize: z.number().min(1, 'ファイルサイズは必須です'),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
});

// api001-upload: 署名付きURL発行レスポンス
export const createPresignedUrlResponse = z.object({
  uploadUrl: z.string(),
  key: z.string(),
});

// api002-upload: アップロード完了・メタデータ登録レスポンス
export const createImageMetadataResponse = z.object({
  id: z.string(),
  url: z.string(),
});

// api003-upload: 画像一覧取得レスポンス
export const getImageListResponse = z.array(z.object({
  id: z.string(),
  fileName: z.string(),
  createdAt: z.string(),
}));

// api004-upload: 画像閲覧用URL取得レスポンス
export const getImageUrlResponse = z.object({
  url: z.string(),
  expiresAt: z.string(),
});

// 型エクスポート
export type CreatePresignedUrlRequest = z.infer<typeof createPresignedUrlSchema>;
export type CreateImageMetadataRequest = z.infer<typeof createImageMetadataSchema>;
export type CreatePresignedUrlResponse = z.infer<typeof createPresignedUrlResponse>;
export type CreateImageMetadataResponse = z.infer<typeof createImageMetadataResponse>;
export type GetImageListResponse = z.infer<typeof getImageListResponse>;
export type GetImageUrlResponse = z.infer<typeof getImageUrlResponse>;
