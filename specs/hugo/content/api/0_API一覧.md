---
title: "API一覧"
weight: 1
---
# API一覧

| ID | メソッド | パス | 概要 |
|:---|:---|:---|:---|
| [api001](/api/images/api001-upload/) | POST | `/api/v1/images/presigned-url` | S3アップロード用の署名付きURLを発行する |
| [api002](/api/images/api002-upload/) | POST | `/api/v1/images/complete` | アップロード完了後のメタデータ登録 |
| [api003](/api/images/api003-upload/) | GET | `/api/v1/images` | アップロード済み画像の名前リスト取得 |
| [api004](/api/images/api004-upload/) | GET | `/api/v1/images/:id` | 画像の閲覧用URL（Presigned）取得 |
