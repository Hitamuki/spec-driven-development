/** ファイルサイズ上限（MB単位） */
export const MAX_FILE_SIZE_MB = 5;
/** ファイルサイズ上限の表示用文字列 */
export const MAX_FILE_SIZE_DISPLAY = `${MAX_FILE_SIZE_MB}MB`;
/** アップロード可能な最大枚数 */
export const MAX_UPLOAD_COUNT = 5;

/**
 * UIに表示するエラー・成功メッセージ定義
 * 仕様書のメッセージIDに対応している
 */
export const MESSAGES = {
  "MSG-UI-001": "対応していないファイル形式です。",
  "MSG-UI-002": `ファイルサイズが上限（${MAX_FILE_SIZE_DISPLAY}）を超えています。`,
  "MSG-UI-003": "アップロードがタイムアウトしました。再度お試しください。",
  "MSG-UI-004": "アップロードに失敗しました。URLの有効期限が切れている可能性があります。",
  "MSG-UI-005": "ファイルアクセス権限がありません。",
  "MSG-UI-006": "最大アップロード数に達しました。",
  "MSG-UI-007": "署名付きURLの取得に失敗しました。再度お試しください。",
  "MSG-UI-C001": "画像を登録しました。",
  "MSG-UI-C004": "通信エラーが発生しました。再度お試しください。",
  "MSG-UI-C005": "サーバーエラーが発生しました。しばらくしてから再度お試しください。",
} as const;

/**
 * UI上に表示するラベル・テキストの定数
 * コンポーネント内にハードコードせず一元管理する
 */
export const UI_TEXT = {
  UPLOAD_FORM: {
    TITLE: "画像アップロード",
    DESCRIPTION: (max: number) => `画像を選択してアップロードしてください（最大${max}枚）`,
    SELECT_BUTTON: "画像を選択",
    SELECTED_LABEL: "選択中: ",
    UPLOAD_BUTTON: "アップロード",
    UPLOADING_BUTTON: "アップロード中...",
    SUCCESS_TOAST: "登録完了",
    FAILURE_TOAST: "登録エラー",
    ERROR_LOG_PREFIX: "アップロードエラー:",
  },
  IMAGE_LIST: {
    TITLE: (count: number, max: number) => `アップロード済み画像 (${count}/${max})`,
    DESCRIPTION: "クリックしてプレビューを表示",
    EMPTY_STATE: "まだ画像がアップロードされていません",
  },
  UPLOAD_PAGE: {
    TITLE: "画像アップロード管理",
    DESCRIPTION: "ローカル画像を選択・プレビューし、アップロード済み画像を管理できます。",
    PREVIEW_TITLE: "プレビュー: ",
  }
} as const;

/** ファイルサイズ上限（バイト単位） */
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
/** 許可するファイル拡張子の一覧 */
export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
/** 許可するMIMEタイプの一覧 */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
