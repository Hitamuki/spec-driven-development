import type { ListImages200Item } from '@image-upload/api';

/**
 * APIレスポンスの画像メタデータ型をそのまま利用する
 */
export type UploadedImage = ListImages200Item;

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface StatusMessage {
  type: "success" | "error" | "warning";
  text: string;
}
