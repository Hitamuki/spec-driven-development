# @image-upload/ui

このパッケージは、システムの共通UIコンポーネントを管理するためのパッケージです。
[shadcn/ui](https://ui.shadcn.com/) をベースにしており、モノレポ構成内でフロントエンドアプリから共有して利用されます。

## 概要

- **設計思想**: shadcn/ui に基づく再利用可能なコンポーネント管理
- **技術スタック**: React, Tailwind CSS, Lucide React, class-variance-authority, tailwind-merge

## コンポーネントの追加方法

新しい shadcn/ui コンポーネントを追加する場合、以下のいずれかの方法を実行します。

### 1. リポジトリのルートから追加する（推奨）

モノレポのルートディレクトリから以下のコマンドを実行します。`-c packages/ui` を指定することで、このパッケージ内にコンポーネントがインストールされます。

```bash
pnpm dlx shadcn@latest add [component-name] -c packages/ui
```

例:
```bash
pnpm dlx shadcn@latest add button -c packages/ui
```

### 2. packages/ui ディレクトリ内で追加する

```bash
cd packages/ui
pnpm dlx shadcn@latest add [component-name]
```

## 利用方法

追加したコンポーネントを使用するには、`src/index.ts` からエクスポートする必要があります。

```typescript
// packages/ui/src/index.ts
export * from "./components/ui/button"
```

その後、他のパッケージ（`apps/frontend` など）からインポートして利用します。

```tsx
import { Button } from "@image-upload/ui"
```

## ディレクトリ構成

- `src/components/ui`: shadcn/ui によって生成された生のコンポーネント
- `src/lib/utils.ts`: Tailwind CSS のクラス結合用ユーティリティ
- `src/index.ts`: 外部公開用エントリーポイント