# Specs Hugo Site

`specs/` 配下の仕様書を Hugo で静的サイトとして閲覧するための設定です。

## 概要

- テーマ: [hugo-book](https://github.com/alex-shpak/hugo-book)
- コンテンツ: `content/` 以下に specs の各ドキュメントを配置

## セットアップ

```bash
# テーマの初期化（初回のみ）
git submodule update --init --recursive
```

## 使用方法

```bash
# ローカルサーバー起動
hugo server --buildDrafts
```

ブラウザで http://localhost:1313 を開く。

## ディレクトリ構成

```
specs/hugo/
├── content/          # 仕様書
│   ├── common/
│   ├── api/
│   ├── db/
│   ├── infra/
│   ├── interaction/
│   ├── requirements/
│   ├── security/
│   └── ui/
├── themes/book/      # hugo-book テーマ（git submodule）
└── hugo.toml         # Hugo 設定
```

## キャッシュのクリア

```bash
rm -rf public resources
```

## 仕様書の更新

`specs/` 配下のファイルを編集した場合は `content/` にも反映してください。
