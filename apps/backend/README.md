# @image-upload/backend

画像アップロード機能のバックエンドAPI

## 概要

このパッケージは、画像アップロード機能のバックエンドAPIを提供します。Honoフレームワークを使用し、S3連携とPostgreSQLによるデータ管理を実装しています。

## 技術スタック

- **Runtime**: Bun
- **Framework**: Hono
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Storage**: AWS S3
- **Validation**: Zod
- **Logging**: Pino
- **Architecture**: DDD Lite

## 🏗️ アーキテクチャ

### レイヤー構成

```
apps/backend/src/
├── index.ts              # エントリーポイント、ミドルウェア設定
├── routes/
│   └── images.ts         # 画像関連APIエンドポイント
├── services/
│   └── imageService.ts   # ビジネスロジック層
└── middleware/
    └── (ミドルウェア群)
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

### 3. データベースセットアップ
```bash
# PostgreSQL起動
docker-compose up -d

# マイグレーション実行
cd packages/db
pnpm run db:migrate --name init
```

### 4. 開発サーバー起動
```bash
pnpm run dev
```

### 5. ヘルスチェック
```bash
curl http://localhost:3001/health
```

## 📝 環境変数

### 必須項目

| 変数名 | 説明 | 例 |
|:---|:---|:---|
| `DATABASE_URL` | PostgreSQL接続文字列 | `postgresql://user:password@localhost:5434/image_upload` |
| `AWS_ACCESS_KEY_ID` | AWSアクセスキー | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWSシークレットキー | `...` |
| `S3_BUCKET_NAME` | S3バケット名 | `my-image-bucket` |

### オプション項目

| 変数名 | 説明 | デフォルト値 |
|:---|:---|:---|
| `PORT` | サーバーポート | `3001` |
| `NODE_ENV` | 実行環境 | `development` |
| `AWS_REGION` | AWSリージョン | `us-east-1` |
| `LOG_LEVEL` | ログレベル | `info` |

## 🧪 開発

### 開発コマンド
```bash
# 開発サーバー起動
pnpm run dev

# ビルド
pnpm build

# 型チェック
pnpm type-check

# リント
pnpm lint

# テスト
pnpm test
```

## 🚀 デプロイ

### 本番環境
```bash
# ビルド
pnpm build

# 環境変数設定
export NODE_ENV=production
export DATABASE_URL=postgresql://...
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export S3_BUCKET_NAME=...

# 起動
pnpm start
```

### Dockerデプロイ
```dockerfile
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN bun install --frozen-lockfile --production
COPY . .
RUN bun build src/index.ts --outdir dist
EXPOSE 3001
CMD ["bun", "dist/index.js"]
```

## 🐛 トラブルシューティング

### よくある問題

#### 1. DB接続エラー
```bash
# 接続確認
docker-compose ps postgres
docker-compose logs postgres

# 環境変数確認
echo $DATABASE_URL
```

#### 2. S3アクセスエラー
```bash
# AWS認証情報確認
aws s3 ls s3://$S3_BUCKET_NAME

# IAM権限確認
aws iam get-user
```

#### 3. メモリ不足
```bash
# メモリ使用量確認
ps aux | grep bun

# プロセス再起動
pkill -f bun
pnpm run dev
```
