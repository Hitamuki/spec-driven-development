# @hitamuki/api

API Client（Orvalによる型・Client生成）

## 概要

このパッケージは、OpenAPI仕様書から型安全なAPIクライアントを自動生成するための設定です。

### 特徴

- **型安全**: TypeScriptの完全な型サポート
- **自動ヘッダー**: trace_idとrequest_idを自動付与
- **スキーマ生成**: Zodによるバリデーションスキーマ
- **DRY原則**: OpenAPI仕様書をSingle Source of Truthとして管理

## セットアップ

### 1. 依存関係インストール

```bash
pnpm install
```

### 2. APIクライアント生成

```bash
pnpm generate
```

このコマンドにより、以下のファイルが生成されます：

- `src/api.ts` - APIクライアント本体
- `src/schemas/` - Zodスキーマ定義
- `src/types/` - TypeScript型定義

### 3. 利用方法

```typescript
import { getPresignedUrl, completeUpload, listImages, getImage } from '@hitamuki/api';

// 署名付きURL発行
const result = await getPresignedUrl({
  fileName: 'example.jpg',
  fileSize: 1024000,
  contentType: 'image/jpeg'
});

// 画像一覧取得
const images = await listImages();
```

## 設定ファイル

### orval.config.ts

Orvalの動作を設定するファイル：

- **出力モード**: `split`（ファイル分割）
- **クライアント**: `axios`
- **ミューテーター**: カスタムヘッダー付与
- **クエリ設定**: TanStack Query対応

### mutator.ts

すべてのAPIリクエストに共通処理を適用：

```typescript
// 自動で付与されるヘッダー
{
  'X-Trace-ID': crypto.randomUUID(),
  'X-Request-ID': crypto.randomUUID()
}
```

## 開発コマンド

```bash
# APIクライアント再生成
pnpm generate

# 型チェック
pnpm type-check

# リント
pnpm lint

# リント修正
pnpm lint:fix

# ビルド
pnpm build
```

## OpenAPI仕様書

- **ファイル**: `openapi.yaml`
- **ベースURL**: `/api/v1`
- **共通ヘッダー**: 
  - `X-Trace-ID`: トレーシング用ID
  - `X-Request-ID`: 冪等性用ID

## トレーサビリティ

すべてのAPIリクエストには自動的にtrace_idが付与され、フロントエンドからS3、バックエンド、DBまでのログ追跡が可能です。

## 注意事項

- OpenAPI仕様書を更新した場合は必ず `pnpm generate` を実行
- 生成されたファイルは直接編集しない（変更は上書きされる）
- ミューテーターによる共通処理は `src/mutator.ts` でカスタマイズ可能
