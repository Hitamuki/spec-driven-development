/**
 * セキュリティポリシーとバリデーションルール
 */

/** 許可されるContent-Type一覧 */
export const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

/** 許可拡張子表示用の一覧 */
export const ALLOWED_CONTENT_TYPES_DISPLAY = 'jpeg, png, gif, webp';

/** 許可されるMIMEタイプとマジックナンバー・拡張子のマッピング */
export const ALLOWED_MIME_TYPES = {
  'image/jpeg': {
    magicNumbers: [0xFF, 0xD8, 0xFF],
    extensions: ['.jpg', '.jpeg'],
  },
  'image/png': {
    magicNumbers: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    extensions: ['.png'],
  },
  'image/gif': {
    magicNumbers: [0x47, 0x49, 0x46, 0x38],
    extensions: ['.gif'],
  },
  'image/webp': {
    magicNumbers: [0x52, 0x49, 0x46, 0x46], // RIFF
    extensions: ['.webp'],
  },
} as const;

/** ファイルサイズ制限（バイト単位） */
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_FILE_SIZE_DISPLAY = `${MAX_FILE_SIZE_MB}MB`;

/** アップロード枚数制限 */
export const MAX_UPLOAD_COUNT = 5;

/** Presigned URLの有効期限（秒単位） */
export const PRESIGNED_URL_EXPIRY = {
  upload: 5 * 60, // 5分
  view: 60 * 60, // 1時間
} as const;

/** S3バリデーションモード */
export const S3_VALIDATION_MODES = {
  strict: 'strict',
  skip: 'skip',
} as const;

/** S3 Presigned URL生成モード */
export const S3_PRESIGN_MODES = {
  aws: 'aws',
  mock: 'mock',
} as const;

export type S3ValidationMode = (typeof S3_VALIDATION_MODES)[keyof typeof S3_VALIDATION_MODES];
export type S3PresignMode = (typeof S3_PRESIGN_MODES)[keyof typeof S3_PRESIGN_MODES];

/** レート制限（リクエスト数の上限） */
export const RATE_LIMITS = {
  perMinute: 10, // 1分あたりのリクエスト数
  perHour: 100,  // 1時間あたりのリクエスト数
} as const;

/**
 * マジックナンバーによるファイル形式検証
 * Content-Typeと実際のバイナリ内容が一致するかチェックし、偽装アップロードを防ぐ
 * @param buffer - 検証対象のファイルバイナリ（先頭数バイトで十分）
 * @param expectedMimeType - 期待するMIMEタイプ
 * @returns 形式が一致する場合は `true`、不正な場合は `false`
 */
export function validateFileMagicNumber(buffer: ArrayBuffer, expectedMimeType: string): boolean {
  const bytes = new Uint8Array(buffer);
  const expectedMagicNumbers = ALLOWED_MIME_TYPES[expectedMimeType as keyof typeof ALLOWED_MIME_TYPES]?.magicNumbers;

  if (!expectedMagicNumbers) {
    return false;
  }

  // WebPの場合はRIFFヘッダーとWEBP識別子をチェック
  if (expectedMimeType === 'image/webp') {
    if (bytes.length < 12) return false;

    // RIFFヘッダー (0x52, 0x49, 0x46, 0x46)
    const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;

    // WEBP識別子 (0x57, 0x45, 0x42, 0x50)
    const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

    return isRiff && isWebp;
  }

  // その他の形式は先頭バイト列をチェック
  for (let i = 0; i < expectedMagicNumbers.length; i++) {
    if (bytes[i] !== expectedMagicNumbers[i]) {
      return false;
    }
  }

  return true;
}

/**
 * ファイル名の安全性検証
 * パストラバーサル攻撃・特殊文字・過長ファイル名を拒否する
 * @param fileName - 検証対象のファイル名
 * @returns 安全なファイル名の場合は `true`、不正な場合は `false`
 */
export function validateFileName(fileName: string): boolean {
  // パストラバーサル攻撃防止
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }

  // 特殊文字チェック
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(fileName)) {
    return false;
  }

  // 長さチェック
  if (fileName.length > 255) {
    return false;
  }

  return true;
}

/**
 * Content-Typeと拡張子の整合性チェック
 * MIMEタイプに対応しない拡張子のファイルを拒否する
 * @param fileName - 検証対象のファイル名（拡張子含む）
 * @param contentType - 宣言されたMIMEタイプ
 * @returns 整合性がある場合は `true`、不整合の場合は `false`
 */
export function validateContentTypeExtension(fileName: string, contentType: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  const allowedExtensions = ALLOWED_MIME_TYPES[contentType as keyof typeof ALLOWED_MIME_TYPES]?.extensions;

  if (!allowedExtensions) {
    return false;
  }

  return allowedExtensions.some((ext) => ext === extension);
}
