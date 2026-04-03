import type { ListImages200Item } from '@image-upload/api';

/**
 * APIレスポンスの画像メタデータ型をそのまま利用する
 * フロントエンド固有の型定義を避け、API型との乖離を防ぐ
 */
export type UploadedImage = ListImages200Item;

/**
 * 画像アップロードの進行状態
 * idle: 未操作、uploading: アップロード中、success: 成功、error: 失敗
 */
export type UploadStatus = "idle" | "uploading" | "success" | "error";

/**
 * UIに表示するステータスメッセージの型
 * Alertコンポーネントの表示制御に使用する
 */
export interface StatusMessage {
  /** メッセージの種別（表示スタイルに影響） */
  type: "success" | "error" | "warning";
  /** ユーザーに表示するメッセージ本文 */
  text: string;
}
