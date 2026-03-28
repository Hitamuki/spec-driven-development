---
title: "画像アップロード機能"
---
# 画像アップロード機能

## ID

ia001-upload

## 関連仕様・設計

| 種別 | ドキュメント |
|---|---|
| 要件 | [req001-upload](/requirements/req001-upload/) |
| UI | [scr001-upload](/ui/scr001-upload/) |
| API | [api001-upload](/api/images/api001-upload/) |
| API | [api002-upload](/api/images/api002-upload/) |
| API | [api003-upload](/api/images/api003-upload/) |
| API | [api004-upload](/api/images/api004-upload/) |
| インフラ | [infra001-upload](/infra/infra001-upload/) |
| セキュリティ | [sec001-upload](/security/sec001-upload/) |

---

## ユースケース図

```mermaid
graph LR
    Actor((ユーザー))

    subgraph アップロード
        UC1[画像を選択してプレビューする]
        UC2[画像をアップロードする]
    end

    subgraph 閲覧
        UC3[アップロード済み画像の一覧をファイル名で確認する]
        UC4[ファイル名を選択して画像を閲覧する]
    end

    Actor --> UC1
    Actor --> UC2
    Actor --> UC3
    Actor --> UC4
```

---

## シーケンス: 画像アップロード

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザー
    participant FE as フロントエンド
    participant BE as バックエンド
    participant S3 as S3
    participant DB as DB

    User->>FE: ファイル選択
    FE->>FE: クライアントバリデーション（→ scr001-upload バリデーション）
    FE->>FE: プレビュー表示（→ scr001-upload 項目2）

    User->>FE: アップロードボタン押下（→ scr001-upload アクション2）
    FE->>BE: POST /api/v1/images/presigned-url（→ api001-upload）
    Note over FE,BE: X-Trace-ID ヘッダー付与

    BE->>BE: サーバーバリデーション・枚数確認（→ api001-upload バリデーション）
    BE->>S3: PutObject 署名付きURL生成
    S3-->>BE: uploadUrl
    BE-->>FE: uploadUrl, key

    FE->>S3: PUT uploadUrl（バイナリ直接送信）
    S3-->>FE: 200 OK

    FE->>BE: POST /api/v1/images/complete（→ api002-upload）
    BE->>S3: HeadObject（存在確認）
    BE->>BE: マジックナンバー検証（→ api002-upload バリデーション）
    BE->>DB: メタデータ保存（→ db001-upload）
    DB-->>BE: 保存完了
    BE-->>FE: 201 Created（id, url）

    FE->>User: 成功メッセージ・リスト更新（→ scr001-upload 項目4, 項目5）
```

---

## シーケンス: 画像閲覧

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザー
    participant FE as フロントエンド
    participant BE as バックエンド
    participant DB as DB
    participant S3 as S3

    User->>FE: ギャラリー表示
    FE->>BE: GET /api/v1/images（→ api003-upload）
    Note over FE,BE: メタデータ（ID・ファイル名）のみ取得。画像実体は取得しない
    BE->>DB: 画像一覧取得
    DB-->>BE: [{id, fileName, createdAt}]
    BE-->>FE: リスト返却
    FE->>User: ファイル名リスト表示（→ ui001-upload item-5）

    User->>FE: ファイル名クリック（→ ui001-upload act-3）
    Note over FE,BE: 選択時に初めて画像実体（閲覧用URL）を取得
    FE->>BE: GET /api/v1/images/:id（→ api004-upload）
    BE->>S3: GetObject 閲覧用 Presigned URL 生成
    BE-->>FE: url
    FE->>User: プレビュー表示（→ ui001-upload item-6）
```

---

## エラーフロー

| 発生箇所 | 条件 | 挙動 |
|---|---|---|
| クライアントバリデーション | サイズ超過・形式違反 | リクエスト送信せずエラー表示（→ ui001-upload） |
| Presigned URL 発行 | 枚数上限・レート超過 | 409 / 429 を受けてエラー表示（→ api001-upload） |
| S3 PUT | 有効期限切れ | Presigned URL 発行から再試行 |
| S3 PUT / API呼び出し | ネットワークエラー | アップロードを中断し、item-4 に再試行を促すメッセージを表示 |
| マジックナンバー検証失敗 | バイナリ不一致 | S3ファイル削除・422 返却（→ api002-upload） |
