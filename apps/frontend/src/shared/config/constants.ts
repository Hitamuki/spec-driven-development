export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_DISPLAY = `${MAX_FILE_SIZE_MB}MB`;
export const MAX_UPLOAD_COUNT = 5;

export const MESSAGES = {
  "MSG-UI-001": "対応していないファイル形式です。",
  "MSG-UI-002": `ファイルサイズが上限（${MAX_FILE_SIZE_DISPLAY}）を超えています。`,
  "MSG-UI-003": "アップロードがタイムアウトしました。再度お試しください。",
  "MSG-UI-004": "アップロードに失敗しました。URLの有効期限が切れている可能性があります。",
  "MSG-UI-005": "ファイルアクセス権限がありません。",
  "MSG-UI-006": "最大アップロード数に達しました。",
  "MSG-UI-C001": "画像を登録しました。",
  "MSG-UI-C004": "通信エラーが発生しました。再度お試しください。",
  "MSG-UI-C005": "サーバーエラーが発生しました。しばらくしてから再度お試しください。",
} as const;

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

export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
