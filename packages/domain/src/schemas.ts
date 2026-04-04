import { z } from 'zod';
import { API_MESSAGES, API_MESSAGE_CODES, DOMAIN_VALIDATION_MESSAGES } from './messages';
import {
  ALLOWED_CONTENT_TYPES,
  ALLOWED_CONTENT_TYPES_DISPLAY,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_DISPLAY,
} from './policies';

/**
 * 画像アップロードに関するスキーマ定義
 * Zodスキーマはバリデーションと型生成を兼ねる（Single Source of Truth）
 */

// api001-upload: 署名付きURL発行リクエスト
export const createPresignedUrlSchema = z.object({
  fileName: z.string().min(1, DOMAIN_VALIDATION_MESSAGES.FILE_NAME_REQUIRED),
  fileSize: z.number()
    .min(1, DOMAIN_VALIDATION_MESSAGES.FILE_SIZE_REQUIRED)
    .max(MAX_FILE_SIZE, API_MESSAGES[API_MESSAGE_CODES.INVALID_FILE_SIZE](MAX_FILE_SIZE_DISPLAY)),
  contentType: z.enum(ALLOWED_CONTENT_TYPES, {
    errorMap: () => ({
      message: API_MESSAGES[API_MESSAGE_CODES.INVALID_CONTENT_TYPE](ALLOWED_CONTENT_TYPES_DISPLAY)
    })
  }),
});

// api002-upload: アップロード完了・メタデータ登録リクエスト
export const createImageMetadataSchema = z.object({
  key: z.string().min(1, DOMAIN_VALIDATION_MESSAGES.S3_KEY_REQUIRED),
  fileName: z.string().min(1, DOMAIN_VALIDATION_MESSAGES.FILE_NAME_REQUIRED),
  fileSize: z.number().min(1, DOMAIN_VALIDATION_MESSAGES.FILE_SIZE_REQUIRED),
  contentType: z.enum(ALLOWED_CONTENT_TYPES, {
    errorMap: () => ({
      message: API_MESSAGES[API_MESSAGE_CODES.INVALID_CONTENT_TYPE](ALLOWED_CONTENT_TYPES_DISPLAY)
    })
  }),
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

/** api001-upload: 署名付きURL発行リクエストの型 */
export type CreatePresignedUrlRequest = z.infer<typeof createPresignedUrlSchema>;
/** api002-upload: メタデータ登録リクエストの型 */
export type CreateImageMetadataRequest = z.infer<typeof createImageMetadataSchema>;
/** api001-upload: 署名付きURL発行レスポンスの型 */
export type CreatePresignedUrlResponse = z.infer<typeof createPresignedUrlResponse>;
/** api002-upload: メタデータ登録レスポンスの型 */
export type CreateImageMetadataResponse = z.infer<typeof createImageMetadataResponse>;
/** api003-upload: 画像一覧取得レスポンスの型 */
export type GetImageListResponse = z.infer<typeof getImageListResponse>;
/** api004-upload: 画像閲覧用URL取得レスポンスの型 */
export type GetImageUrlResponse = z.infer<typeof getImageUrlResponse>;
