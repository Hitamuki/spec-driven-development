# @image-upload/db

DBアクセス層：PrismaとRepository

## 概要

このパッケージは、Prisma ORMを使用したデータベースアクセス層を提供します。Repositoryパターンを採用し、ビジネスロジックとデータアクセスを分離します。

## 構成

### 📁 ファイル構成

```
packages/db/
├── prisma/
│   ├── schema.prisma      # Prismaスキーマ定義
│   └── init.sql          # PostgreSQL初期化スクリプト
├── src/
│   ├── index.ts          # PrismaClientエクスポート
│   └── repositories/
│       └── xxxRepository.ts  # エンティティのRepository
├── package.json
└── README.md
```

## Prismaセットアップ

### 1. クライアント生成
```bash
pnpm run db:generate
```
- `@prisma/client` のTypeScript型を生成
- `node_modules` 内にクライアントコードが作成される

### 2. マイグレーション実行
```bash
pnpm run db:migrate
```
- スキーマ変更をDBに反映
- マイグレーションファイルを作成

### 3. DBプッシュ（開発用）
```bash
pnpm run db:push
```
- マイグレーションファイルなしでスキーマをDBに反映

### 4. スタジオ起動
```bash
pnpm run db:studio
```
- Prisma Studio（DBブラウザ）を起動

## Docker PostgreSQL環境

### 🚀 起動手順

```bash
# 1. PostgreSQL起動
docker-compose up -d

# 2. 環境変数設定
cp .env.example .env

# 3. マイグレーション実行
cd packages/db
pnpm run db:migrate --name init
```

### 📊 接続情報

- **ホスト**: `localhost:5434`
- **データベース**: `image_upload`
- **ユーザー**: `user`
- **パスワード**: `password`

### 🔧 DBeaver接続設定

```
接続タイプ: PostgreSQL
ホスト: localhost
ポート: 5434
データベース: image_upload
ユーザー: user
パスワード: password
```

## 環境変数

| 変数名 | 説明 | 例 |
|:---|:---|:---|
| `DATABASE_URL` | DB接続文字列 | `postgresql://user:password@localhost:5434/image_upload` |

## 開発コマンド

```bash
# Prismaクライアント生成
pnpm run db:generate

# マイグレーション実行
pnpm run db:migrate

# スキーマをDBに反映（開発用）
pnpm run db:push

# Prisma Studio起動
pnpm run db:studio

# ビルド
pnpm build

# 型チェック
pnpm type-check

# リント
pnpm lint
```

## 注意事項

### ⚠️ 重要

- **マイグレーション**: 本番環境では必ずマイグレーションファイルを使用
- **環境変数**: `.env` ファイルは `.gitignore` に含まれる
- **Prisma Client**: スキーマ変更後は必ず `pnpm run db:generate` を実行

### 🔄 ワークフロー

1. `schema.prisma` を編集
2. `pnpm run db:generate` でクライアント生成
3. `pnpm run db:migrate` でマイグレーション実行
4. RepositoryからDB操作を実装

### 🐛 トラブルシューティング

#### マイグレーションエラー
```bash
# DBリセット
docker-compose down -v
docker-compose up -d
pnpm run db:migrate --name init
```

#### 接続エラー
```bash
# コンテナ状態確認
docker-compose ps

# ログ確認
docker-compose logs postgres
```

## Prismaの利点

### ✅ 型安全
- TypeScriptで完全な型サポート
- 自動補完とコンパイル時チェック

### ✅ クエリビルダー
- 直感的なAPI
- 複雑なクエリも簡単

### ✅ マイグレーション管理
- スキーマ変更の追跡
- ロールバック機能

### ✅ 開発体験
- Prisma Studioでの視覚的確認
- ホットリロード対応
