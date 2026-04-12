# image-upload

![画像アップロード](https://github.com/user-attachments/assets/ef529246-a745-4c17-91bd-822f49ac4814)

## Overview

画像アップロード機能をコアとする、Frontend（React）/ Backend（Hono）/ DB（Prisma）を分離したモノレポ構成のサンプルアプリケーションです。  
要件から設計・実装・テスト・デプロイまでの一連の流れを実施しています。

## Requirement

- macOS / Linux（開発環境）
- Node.js 22+
- pnpm 9.5.0+
- Bun 1.1.0+
- Docker / Docker Compose（PostgreSQL起動用）

## Usage

### 1. リポジトリを取得

```bash
git clone https://github.com/Hitamuki/image-upload.git
cd image-upload
```

### 2. 依存関係をインストール

```bash
pnpm install
```

### 3. 環境変数を設定

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp packages/db/.env.example packages/db/.env
```

### 4. PostgreSQLを起動

```bash
docker compose up -d
```

### 5. Prismaクライアント生成とスキーマ反映

```bash
pnpm -F @image-upload/db db:generate
pnpm -F @image-upload/db db:push
```

### 6. 開発サーバー起動（フロント + バックエンド）

```bash
pnpm dev
```

または個別起動:

```bash
pnpm -F @image-upload/frontend dev
pnpm -F @image-upload/backend dev
```

### 7. よく使うコマンド

```bash
# テスト
pnpm test

# Lint
pnpm lint

# ビルド
pnpm build

# DB GUI（Prisma Studio）
pnpm -F @image-upload/db db:studio
```

## Features

- モノレポ構成
  - `apps/frontend`: React + React Router + TanStack Query
  - `apps/backend`: Hono + Bun + Pino
  - `packages/db`: Prisma + PostgreSQL
  - `packages/domain`: ドメインロジック（DDD Lite）
  - `packages/api`: OpenAPI/Orvalによる型安全APIクライアント
- セキュリティ重視設計
  - レート制限、trace_id/request_id、S3アップロードポリシー
- テスト戦略
  - Unit（Vitest）/ API / E2E / Security テストの層別運用

## Reference

- プロジェクト設計ルール
  - AGENTS.md
- 仕様ドキュメント
  - specs/hugo/content

## Author

- GitHub: <https://github.com/Hitamuki>

## License

MITライセンス
