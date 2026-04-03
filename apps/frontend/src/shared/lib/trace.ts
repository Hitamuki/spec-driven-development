/**
 * トレースID管理モジュール
 * フロントエンドで生成したUUID v4をすべてのAPIリクエストに付与し、
 * バックエンドからログまで横断的な追跡を可能にする
 */

/**
 * 新しいトレースIDをUUID v4形式で生成する
 * @returns 新規生成したUUID v4文字列
 */
export function generateTraceId(): string {
  return crypto.randomUUID();
}

/**
 * セッション内で共有する現在のトレースID
 * null の場合は初回取得時に自動生成される
 */
let currentTraceId: string | null = null;

/**
 * 現在のトレースIDを返す。未生成の場合は新規生成して返す
 * セッション内で同一のトレースIDを維持するために使用する
 * @returns 現在のトレースID
 */
export function getTraceId(): string {
  if (!currentTraceId) {
    currentTraceId = generateTraceId();
  }
  return currentTraceId;
}

/**
 * トレースIDを新規生成してセッションをリセットする
 * 操作の区切り（新規アップロード開始など）に呼び出す
 * @returns 新たに生成したトレースID
 */
export function refreshTraceId(): string {
  currentTraceId = generateTraceId();
  return currentTraceId;
}
