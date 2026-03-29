---
title: "API一覧"
weight: 1
---
# API一覧

| ID | メソッド | パス | 概要 |
|:---|:---|:---|:---|
| [api001]({{< relref "api001-upload.md" >}}) | POST | `/images/presigned-url` | S3アップロード用の署名付きURLを発行する |
| [api002]({{< relref "api002-upload.md" >}}) | POST | `/images` | 画像メタデータを登録する |
| [api003]({{< relref "api003-upload.md" >}}) | GET | `/images` | アップロード済み画像の名前リスト取得 |
| [api004]({{< relref "api004-upload.md" >}}) | GET | `/images/:id` | 画像の閲覧用URL（Presigned）取得 |
