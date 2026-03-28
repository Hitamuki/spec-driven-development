# ADR: specs層からGherkinとEARSを廃止しdocsに統合

## ステータス
承諾済み

## コンテキスト
`specs/gherkin/`（ユースケース記述）と `specs/ears/`（論理仕様）が `docs/` 配下の設計ドキュメントと内容が重複しており、二重管理が発生していた。

具体的には：
- `specs/gherkin/uc001-upload.md` のシナリオ → `docs/interaction/ia001-upload.md` のシーケンス図・エラーフロー表に記述済み
- `specs/ears/eas001-upload.md` の条件仕様 → `docs/api/api001-upload.md` のバリデーション表に記述済み

## 意思決定
以下の方針で整理する。

1. `specs/gherkin/` と `specs/ears/` を廃止・削除する。
2. 各ドキュメントに不足していた内容を適切な `docs/` 配下に追記する。
   - 上限到達時のUI制御（メッセージ表示）→ `docs/ui/ui001-upload-layout.md`
   - ネットワークエラー時の再試行 → `docs/interaction/ia001-upload.md`
3. `specs/` は `requirements/`（ビジネス要件・非機能要件）のみとし、「What」の定義を一本化する。

## 影響

### メリット
- 二重管理の解消により、仕様変更時の更新箇所が一元化される。
- `specs/` の役割が `requirements/` に絞られ、責務がより明確になる。

### デメリット / リスク
- Gherkin形式のシナリオ記述が失われるため、受け入れ条件の可読性がやや低下する可能性がある。
- 将来的にE2Eテストとの紐付けを行う際、Gherkin形式の復活を検討する必要が生じる場合がある。

## 関連ADR
- [20260328-仕様と設計の分離および開発フローの再定義](./20260328-仕様と設計の分離および開発フローの再定義.md)
