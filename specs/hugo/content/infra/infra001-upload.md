---
title: "画像アップロード機能"
---
# 画像アップロード機能

## ID

infra001-upload

## 関連仕様・設計

- [req001-upload](/requirements/req001-upload/)
- [ia001-upload](/interaction/ia001-upload/)
- [システム構成図](/common/システム構成図/)

---

## 使用リソース

| リソース | 用途 |
|---|---|
| AWS S3 | 画像ファイルの保存 |
| AWS CloudFront | CDN・APIプロキシ |
| AWS Lambda | Hono (Bun) バックエンド実行 |
| Amazon RDS (PostgreSQL) | 画像メタデータの永続化 |

---

## S3 バケット設定

- **パブリックアクセス**: Block Public Access を有効化し、直接公開を禁止する。
- **オブジェクトアクセス**: Presigned URL 経由のみ許可（アップロード用 PUT・閲覧用 GET）。
- **暗号化**: SSE-S3（サーバーサイド暗号化）を有効化する。
- **CORS**: フロントエンドオリジンからの `PUT` のみ許可する。

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://<frontend-domain>"],
      "AllowedMethods": ["PUT"],
      "AllowedHeaders": ["Content-Type"],
      "MaxAgeSeconds": 300
    }
  ]
}
```

---

## Presigned URL

| 種別 | 操作 | 有効期限 |
|---|---|---|
| アップロード用 | PutObject | 300 秒（5 分） |
| 閲覧用 | GetObject | 3600 秒（1 時間） |

---

## ネットワーク

- 全通信は HTTPS（TLS 1.2 以上）。
- Lambda・RDS はプライベートサブネットに配置し、外部直接アクセスを禁止する。
- Terraform にて定義する（`packages/infra/`）。
