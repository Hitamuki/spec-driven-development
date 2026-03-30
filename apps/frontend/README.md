# @hitamuki/frontend

画像アップロード機能のフロントエンドSPA

## 概要

このパッケージは、画像アップロード機能のフロントエンドSPAを提供します。ReactとTypeScriptを使用し、モダンなUI/UXと優れた開発体験を実現しています。

## 技術スタック

- **Framework**: React 19
- **Language**: TypeScript
- **Router**: React Router v6
- **State Management**: TanStack Query
- **UI Library**: shadcn/ui
- **Styling**: TailwindCSS
- **API Client**: Orval生成クライアント
- **Build Tool**: Vite
- **Testing**: Vitest + Testing Library

## 🏗️ アーキテクチャ

### Feature-Sliced Design (FSD)

```
apps/frontend/src/
├── app/
│   ├── providers/      # プロバイダー設定
│   ├── router/         # ルーター設定
│   └── styles/         # グローバルスタイル
├── pages/
│   └── image-upload/   # 画像アップロードページ
├── features/
│   └── image-upload/   # 画像アップロード機能
│       ├── ui/         # UIコンポーネント
│       ├── api/        # API呼び出し
│       └── model/      # 型定義
├── entities/
│   └── image/          # 画像エンティティ
├── shared/
│   ├── ui/             # 共通UIコンポーネント
│   ├── lib/            # ユーティリティ
│   └── config/         # 設定
└── index.tsx           # エントリーポイント
```

## 🔧 セットアップ

### 1. 依存関係インストール
```bash
pnpm install
```

### 2. 環境変数設定
```bash
cp .env.example .env
# .envファイルを編集
```

### 3. 開発サーバー起動
```bash
pnpm run dev
```

### 4. アプリケーションアクセス
```
http://localhost:3000
```

## 📝 環境変数

### 必須項目

| 変数名 | 説明 | 例 |
|:---|:---|:---|
| `VITE_API_BASE_URL` | APIベースURL | `http://localhost:3001/api/v1` |

## 🧪 テスト

### 単体テスト
```bash
# コンポーネントテスト
pnpm test

# カバレッジ
pnpm test:coverage
```

### E2Eテスト
```bash
# Playwrightテスト
pnpm test:e2e

# テスト実行
pnpm test:e2e:run
```

## 🔧 開発

### 開発コマンド
```bash
# 開発サーバー起動
pnpm run dev

# ビルド
pnpm run build

# プレビュー
pnpm run preview

# 型チェック
pnpm run type-check

# リント
pnpm run lint

# テスト
pnpm run test
```

### ホットリロード
- **Fast Refresh**: コンポーネントの即時反映
- **HMR**: スタイルのホットリプレースメント
- **ファイルウォッチャー**: 自動再ビルド

### デバッグ
```typescript
// React DevTools
// Redux DevTools（使用する場合）
// VS Codeデバッガー設定
```

## 🚀 デプロイ

### 本番環境ビルド
```bash
# ビルド
pnpm run build

# プレビュー
pnpm run preview
```

### 静的ファイル
```bash
# 生成ファイル
dist/
├── assets/
├── index.html
└── ...
```

### 環境変数設定
```bash
# Vercel
vercel env add VITE_API_BASE_URL

# Netlify
netlify env:set VITE_API_BASE_URL "https://api.example.com"
```

## 🐛 トラブルシューティング

### よくある問題

#### 1. ファイルアップロードエラー
```bash
# ファイルサイズ確認
ls -lh image.jpg

# MIMEタイプ確認
file --mime-type image.jpg

# ネットワーク確認
curl -I http://localhost:3001/api/v1/images/presigned-url
```

#### 3. ビルドエラー
```bash
# 依存関係確認
pnpm install

# キャッシュクリア
pnpm store prune

# 型チェック
pnpm run type-check
```

### デバッグツール
- **React DevTools**: コンポーネントデバッグ
- **Networkタブ**: API通信確認
- **Console**: エラー・警告確認
- **Lighthouse**: パフォーマンス監査
