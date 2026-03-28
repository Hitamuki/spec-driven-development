---
title: "APIメッセージ一覧表"
weight: 3
---
# APIメッセージ一覧表

APIレスポンスに含まれるエラーメッセージを管理する。`{変数名}` は動的に置換される。

## 共通メッセージ

全APIで共通して使用するメッセージ。

| メッセージID | ステータスコード | code | メッセージテンプレート | 変数 |
|:---|:---|:---|:---|:---|
| MSG-API-C001 | 429 | `RATE_LIMIT_EXCEEDED` | リクエスト数が上限（{limit}回/{window}）を超えました | `limit`: 上限回数（例: 10）、`window`: 時間窓（例: 1分） |
| MSG-API-C002 | 500 | `INTERNAL_SERVER_ERROR` | サーバーエラーが発生しました | — |

## 個別メッセージ

| メッセージID | ステータスコード | code | メッセージテンプレート | 変数 | 発生条件 |
|:---|:---|:---|:---|:---|:---|
| MSG-API-001 | 400 | `INVALID_FILE_SIZE` | ファイルサイズが上限（{maxSize}）を超えています | `maxSize`: 上限サイズ（例: 5MB） | fileSize > 5,242,880 bytes |
| MSG-API-002 | 400 | `INVALID_CONTENT_TYPE` | 対応していないファイル形式です（許可形式: {allowedTypes}） | `allowedTypes`: 許可MIMEタイプ一覧（例: jpeg, png, gif, webp） | contentType が許可リスト外 |
| MSG-API-003 | 409 | `UPLOAD_LIMIT_EXCEEDED` | アップロード可能な枚数の上限（{maxCount}枚）に達しています | `maxCount`: 上限枚数（例: 2） | アップロード済み枚数 >= 上限 |
| MSG-API-004 | 422 | `INVALID_FILE_BINARY` | ファイルのバイナリ検証に失敗しました | — | マジックナンバー不一致 |
| MSG-API-005 | 404 | `FILE_NOT_FOUND_ON_S3` | S3上にファイルが存在しません | — | HeadObject で対象キーが見つからない |
| MSG-API-006 | 404 | `IMAGE_NOT_FOUND` | 指定された画像が存在しません（id: {id}） | `id`: リクエストされた画像ID | DBに対象IDが存在しない |
