/**
 * specs/hugo/content/design/api/2_APIメッセージ一覧表.md をベースにした
 * backend/domain共通のメッセージ定義
 */
export const API_MESSAGE_CODES = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  INVALID_FILE_SIZE: 'INVALID_FILE_SIZE',
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
  UPLOAD_LIMIT_EXCEEDED: 'UPLOAD_LIMIT_EXCEEDED',
  INVALID_FILE_BINARY: 'INVALID_FILE_BINARY',
  FILE_NOT_FOUND_ON_S3: 'FILE_NOT_FOUND_ON_S3',
  IMAGE_NOT_FOUND: 'IMAGE_NOT_FOUND',
} as const;

export const API_MESSAGES = {
  [API_MESSAGE_CODES.RATE_LIMIT_EXCEEDED]: (limit: number, window: string): string =>
    `リクエスト数が上限（${limit}回/${window}）を超えました`,
  [API_MESSAGE_CODES.INTERNAL_SERVER_ERROR]: 'サーバーエラーが発生しました',
  [API_MESSAGE_CODES.INVALID_FILE_SIZE]: (maxSize: string): string =>
    `ファイルサイズが上限（${maxSize}）を超えています`,
  [API_MESSAGE_CODES.INVALID_CONTENT_TYPE]: (allowedTypes: string): string =>
    `対応していないファイル形式です（許可形式: ${allowedTypes}）`,
  [API_MESSAGE_CODES.UPLOAD_LIMIT_EXCEEDED]: (maxCount: number): string =>
    `アップロード可能な枚数の上限（${maxCount}枚）に達しています`,
  [API_MESSAGE_CODES.INVALID_FILE_BINARY]: 'ファイルのバイナリ検証に失敗しました',
  [API_MESSAGE_CODES.FILE_NOT_FOUND_ON_S3]: 'S3上にファイルが存在しません',
  [API_MESSAGE_CODES.IMAGE_NOT_FOUND]: (id: string): string =>
    `指定された画像が存在しません（id: ${id}）`,
} as const;

export const DOMAIN_ERROR_MESSAGES = {
  INVALID_FILE_NAME: 'ファイル名が不正です',
  INVALID_FILE_FORMAT: 'ファイル形式が不正です',
} as const;

export const DOMAIN_VALIDATION_MESSAGES = {
  FILE_NAME_REQUIRED: 'ファイル名は必須です',
  FILE_SIZE_REQUIRED: 'ファイルサイズは必須です',
  S3_KEY_REQUIRED: 'S3オブジェクトキーは必須です',
} as const;
