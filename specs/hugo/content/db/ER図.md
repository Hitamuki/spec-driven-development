---
title: "ER図"
---
# ER図

## 関連ドキュメント

- [テーブル定義書](/db/テーブル定義書/)
- [req001-upload](/requirements/req001-upload/)

## ER図

```mermaid
erDiagram
    IMAGE {
        string id PK "UUID v4"
        string file_name "元のファイル名"
        int file_size "ファイルサイズ (bytes)"
        string content_type "MIMEタイプ"
        string s3_key UK "S3上の保存パス（一意）"
        string trace_id "トレーサビリティID"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }
```
