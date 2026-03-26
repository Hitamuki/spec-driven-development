# AGENTS.md

## 概要

本システムは、画像アップロード機能を中心としたSPA構成とし、
仕様駆動開発（Spec Driven Development）およびモノレポ構成を採用する。

## 目的

本リポジトリは **Spec Driven Development（仕様駆動開発）** を採用する。
すべての実装は **specs を唯一の真実（Single Source of Truth）** とし、そこから導出される。

## ディレクトリ構成

```txt
repo/
├── apps/
│   ├── frontend/                 # React SPA（UI層：ユーザー体験の実装）
│   │   ├── src/
│   │   └── tests/                # UI単体テスト（Vitest / Testing Library）
│   └── backend/                  # Hono（Interface層：APIエンドポイント）
│       ├── src/
│       └── tests/                # API単体テスト（ルーティング / ミドルウェア）
├── packages/
│   ├── api/                      # API（Orvalによる型生成）
│   ├── db/                       # DBアクセス層（Prisma / Repository）
│   ├── domain/                   # ドメイン層（ビジネスロジックの中核）
│   ├── infra/                    # IaC（Terraform）
│   ├── ui/                       # 共通UI（shadcn/uiベース）
│   └── shared/                   # 横断的関心事（trace_id / logger / config）
├── specs/                        # 実装を拘束する「機械可読な契約」
│   ├── requirements/             # 要件（ビジネス・非機能）
│   ├── gherkin/                  # ユースケース（振る舞い）
│   ├── ears/                     # 厳密仕様（条件分岐・例外）
│   ├── api/                      # OpenAPI
│   ├── db/                       # DB仕様
│   └── security/                 # セキュリティ仕様
├── docs/                         # 人間の理解・意思決定の記録
│   ├── architecture/             # 全体構造・設計思想
│   ├── sequence/                 # 時系列設計（Mermaid）
│   ├── ADR/                      # ADR（意思決定記録）
│   └── ...                       # その他設計ドキュメント
├── tests/                        # 横断的テスト（仕様検証）
│   ├── api/                      # APIテスト（OpenAPI準拠）
│   ├── e2e/                      # ユースケーステスト
│   └── security/                 # 攻撃再現テスト
└── AGENTS.md                     # AI開発ルール（本ファイル）
```

## 技術構成

### 開発基盤

- **Tool Manager**: mise
- **Monorepo**: pnpm Catalogs + Turborepo
- **Lint/Formatter**: Biome
- **CI/CD**: GitHub Actions
- **TypeScript**: JSDoc によるドキュメント記述（全パッケージ共通）
- **Validation**: Zod（全パッケージ共通）

### フロントエンド

- **Framework**: React
- **Router**: React Router（Loader / Action によるデータフェッチ・ミューテーション）
- **Architecture**: Feature-Sliced Design（FSD）
- **UI**: shadcn/ui
- **State Management**: TanStack Query
- **API Client**: Orval (OpenAPIから自動生成)

### バックエンド

- **Runtime**: Bun
- **Framework**: Hono
- **Logging**: Pino
- **Middleware**: trace_id, request_id, レート制限, CORS, エラーハンドリング

### ドメイン・DB・インフラ

- **Architecture**: DDD Lite（戦術パターン：Entity / Value Object / Repository / Domain Service）
- **DB**: PostgreSQL / Prisma
- **Infrastructure**: AWS (S3, CloudFront, Lambda) / Terraform

### テスト

- **Unit Test**: Vitest
- **API Test**: REST Client
- **E2E Test**: Playwright

## コア原則

### 1. Specs First

実装前に必ず specs を定義する。

- 禁止事項：specsなしでコードを書く、docsのみで仕様を定義する。

### 2. Single Source of Truth

仕様は必ず specs にのみ存在する。

- docsに「真実としての仕様」を書いてはいけない。

### 3. Traceability（トレーサビリティ）

すべての実装はID（uc-xxx, api-xxx 等）で紐づける。

### 4. ID 命名・ファイル命名規則

すべてファイル名もこのID命名規則（`{layer}-{domain}-{nnn}-{action}`）に従い、`{ID}.md` 形式で作成・管理する。

- **Layer 例**: `uc` (Gherkin), `api` (OpenAPI), `db` (Database), `sec` (Security), `req` (Requirement), `eas` (EARS), `arch` (Architecture), `seq` (Sequence)
- **命名例**：`uc-upload-001`, `api-upload-001-create-url`

### 5. 関心の分離

- **frontend**: UI/UXの構築
- **backend**: ルーティングとミドルウェア
- **domain**: ビジネスロジックとセキュリティポリシーの強制
- **infra**: 環境構築とリソース管理

### 6. Security First

セキュリティは後付け禁止。specs/security に定義し、domain/policy で強制する。

### 7. 多層防御 (Defense in Depth)

フロント、API、ストレージ、非同期処理の各層で防御を実装する。

### 8. 言語規約 (Language Rule)

**原則として日本語**で記述する

## 開発フロー

1. **要件定義 (requirements)**: ビジネス要件・非機能要件の整理
2. **ユースケース定義 (Gherkin)**: ユーザー視点の振る舞い定義とID付与 (uc-xxx)
3. **仕様厳密化 (EARS)**: 条件・例外の明確化
4. **セキュリティ仕様定義 (specs/security)**: 脅威モデル、アップロード制約、スキャン等の定義
5. **UI設計 (docs)**: 画面一覧、コンポーネント設計 (shadcn/ui)
6. **シーケンス設計 (docs/sequence)**: API呼び出し順、非同期処理、外部連携の定義
7. **API設計 (OpenAPI)**: リクエスト/レスポンス、エラー、セキュリティ反映
8. **DB設計 (ER図 + DDL)**: データ構造、インデックス、冪等性制御の設計
9. **型生成 (Orval)**: フロント/バック共通型の自動生成
10. **TDD (テスト先行)**: ユースケース単位でのテスト作成（セキュリティテスト含む）
11. **Domain実装**: ビジネスロジックの実装とセキュリティポリシーの適用
12. **Backend実装**: ルーティング、ミドルウェア（trace_id等）の実装
13. **Frontend実装**: UI実装、状態管理、API連携
14. **検証**: E2Eテスト、セキュリティテストによる仕様適合確認
15. **デプロイ (Terraform)**: インフラ構築と環境反映

## 開発規約

### ブランチ戦略 (GitHub Flow)

- **mainブランチ**: 常にデプロイ可能な状態を維持する。
- **トピックブランチ**: `main`からブランチを作成し、機能開発やバグ修正を行う。
  - 命名規則: `feature/issue-id`, `fix/issue-id`, `docs/issue-id` など。

### コミットメッセージ規約 (Conventional Commits)

以下の形式を採用する：
`<type>(<scope>): <subject>`

- **type**:
  - `feat`: 新機能の開発
  - `fix`: バグの修正
  - `docs`: ドキュメントの変更
  - `style`: コードの動作に影響しないフォーマット等の変更
  - `refactor`: リファクタリング
  - `perf`: パフォーマンスの改善
  - `test`: テストの追加・修正
  - `chore`: ビルドプロセスやライブラリの更新など
- **scope**: 変更範囲（例: `frontend`, `backend`, `domain`, `specs` など。任意）
- **subject**: 変更内容の簡潔な要約（原則日本語）

## テスト戦略

### 優先順位

1. **Domainテスト**（最重要：ロジックとポリシー）
2. **APIテスト**（契約適合性）
3. **E2Eテスト**（ユースケース通し）
4. **セキュリティテスト**

### 原則

- テストは仕様 (specs) に基づき、ID単位で記述する。
- 例: `test('uc-upload-001 正常系')`

## セキュリティルール

- **バイナリ検証**: MIMEタイプをマジックナンバーベースで検証
- **制限**: ファイルサイズ、拡張子、レート制限の徹底
- **認可**: Presigned URL の有効期限制御
- **追跡**: request_id による冪等性、trace_id によるトレーサビリティ

## ロギング・観測性

- trace_id は Frontend で生成（UUID v4）し、全リクエストのヘッダー `X-Trace-ID` に付与する。
- Backend middleware で受け取り、全レイヤのログに引き継ぐ。
- ログは Pino で構造化（JSON）出力し、CloudWatch Logs に集約する。
- 障害調査は CloudWatch Logs Insights で trace_id をキーに横断検索する。
- DBへのログ保存は行わない。

## アンチパターン

- specs を更新せずにコードを変更する。
- docs に真実としての仕様を記述する。
- domain を通さずに DB 操作（Prisma直接使用等）を行う。
- フロントエンドに複雑なビジネスロジックを実装する。

## 完了の定義

- specs が存在し、ID で全レイヤ（要件〜テスト）が紐づいている。
- テストがパスし、定義されたセキュリティ要件を満たしている。
- trace_id によりバックエンドからログまで追跡可能である。

## 哲学

コードを書くな、仕様を書け。仕様からコードを生み出せ。
