# Image Upload Infrastructure

このディレクトリには、画像アップロードシステムのAWSインフラストラクチャをTerraformで管理するためのコードが含まれています。

## アーキテクチャ概要

システム構成図に基づき、以下のAWSリソースを構築します：

- **VPC**: プライベート/パブリックサブネット、NAT Gateway、Internet Gateway
- **Security Groups**: Lambda/Bastion用セキュリティグループ
- **S3**: 静的アセット用バケット、画像ストレージ用バケット
- **CloudFront**: CDN配信、SPA配信、APIルーティング
- **API Gateway + Lambda + WAF**: サーバーレスAPIバックエンドとWAFによる防御
- **RDS PostgreSQL**: マネージドデータベース
- **Bastion (EC2)**: RDS接続用踏み台サーバー
- **Secrets Manager**: 秘密情報管理
- **CloudWatch**: ログ管理、監視、アラート

## モジュール構成

```
packages/infra/
├── main.tf                 # プロバイダー設定、共通リソース、SG/Bastionモジュール呼び出し
├── variables.tf            # 入力変数定義
├── outputs.tf              # 出力値定義
├── network.tf              # VPCモジュール呼び出し
├── storage.tf              # S3モジュール呼び出し
├── database.tf             # RDSモジュール呼び出し
├── api.tf                  # API Gateway/Lambdaモジュール呼び出し
├── cloudfront.tf           # CloudFrontモジュール呼び出し
├── secrets.tf              # Secrets Managerモジュール呼び出し
└── modules/                # 各サービスモジュール
   ├── vpc/
   ├── security-groups/
   ├── s3/
   ├── rds/
   ├── api/
   ├── cloudfront/
   ├── bastion/
   ├── secrets/
   └── waf/
```

## デプロイ

### 前提条件

- AWS CLIがインストール・設定済みであること
- Node.js、Bun、pnpmがインストール済みであること
- 各アプリケーションがビルド可能な状態であること
- EC2キーペアが作成済みであること（[「踏み台サーバーへの接続」](#踏み台サーバーへの接続) を参照）

### 1. Backendコードのビルド

Lambda関数のビルドをまず実行：

```bash
cd apps/backend
pnpm build
```

### 2. Terraformの初期化と実行

```bash
cd packages/infra
terraform init
terraform plan
terraform apply
```

（Terraform 実行時に自動的に backend/dist が zip に圧縮されます）

### 3. データベーススキーマの設定 (Prisma)

RDSはプライベートサブネットにあるため、踏み台サーバー経由でSSHトンネルを張る必要があります。
踏み台サーバーへの接続方法は [「踏み台サーバーへの接続」](#踏み台サーバーへの接続) を参照してください。

1. **SSHトンネルの作成**（別ターミナルで実行し、接続を維持したまま次の手順へ）
   ```bash
   ssh -i "~/.ssh/image-upload.pem" -L 5433:[RDSのホスト名]:5432 ec2-user@[踏み台サーバーのパブリックIP] -N
   ```

2. **.env の設定**
   `packages/db/.env` をローカル転送用のアドレスに書き換えます。
   ```text
   # パスワードは英数字のみ（記号なし）を使用してください
   DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5433/imageupload"
   ```

3. **マイグレーションの実行**
   ```bash
   cd packages/db
   pnpm prisma migrate deploy
   pnpm prisma generate
   ```

### 4. Frontendコードのビルドと配布

```bash
# ReactアプリのビルドとS3アップロード
cd apps/frontend
pnpm run build
aws s3 sync dist/ s3://[static-assets-bucket-name]/
```

### 5. CloudFrontキャッシュクリア

```bash
# デプロイ後にキャッシュをクリア
aws cloudfront create-invalidation --distribution-id [cloudfront-distribution-id] --paths "/*"
```

## デストロイ

### Terraformによる削除

```bash
cd packages/infra
terraform destroy
```

### terraform destroy 後に手動削除が必要なもの

`terraform destroy` はTerraformが管理するリソースのみを削除します。以下のリソースはデータ保護のため削除されないか、Terraform管理外のため手動で削除する必要があります。

| リソース                                 | 理由                                                            | 削除方法                                                                              |
| ---------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **S3バケット内のオブジェクト**           | バケット削除前にオブジェクトを空にする必要がある                | `aws s3 rm s3://[bucket-name] --recursive`                                            |
| **S3バケット（バージョニング有効時）**   | 削除マーカーや旧バージョンが残る場合がある                      | AWSコンソール または `aws s3api delete-bucket`                                        |
| **RDSのスナップショット**                | 自動スナップショットはRDS削除後も残る                           | AWSコンソール → RDS → スナップショット                                                |
| **CloudWatch Logsのロググループ**        | ログは自動削除されないことがある                                | AWSコンソール → CloudWatch → ロググループ                                             |
| **Secrets Managerのシークレット**        | 削除スケジュール（デフォルト7〜30日）が設定され即時削除されない | `aws secretsmanager delete-secret --secret-id [name] --force-delete-without-recovery` |
| **ECRイメージ（使用している場合）**      | イメージは明示的に削除されない                                  | AWSコンソール または `aws ecr batch-delete-image ...`                                 |
| **EC2キーペア**                          | Terraform管理外で作成した場合は残る                             | AWSコンソール → EC2 → キーペア、またはローカルの `.pem` ファイルも削除                |
| **IAMユーザー / ポリシー（手動作成分）** | Terraform管理外のIAMリソース                                    | AWSコンソール → IAM                                                                   |

> **注意**: 削除後の復元は困難です。削除前に必要なデータのバックアップを取ってください。

## 踏み台サーバーへの接続

### 秘密鍵の作成

踏み台サーバー（EC2）へ接続するためのSSHキーペアを作成します。

#### 方法1: AWS CLIで作成（推奨）

```bash
# キーペアを作成し、秘密鍵をローカルに保存
aws ec2 create-key-pair \
  --key-name image-upload-bastion \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/image-upload.pem

# 秘密鍵のパーミッションを制限（必須）
chmod 400 ~/.ssh/image-upload.pem
```

作成後、`variables.tf` または `terraform.tfvars` にキーペア名を設定します：

```hcl
key_name = "image-upload-bastion"
```

#### 方法2: AWSコンソールで作成

1. AWSコンソール → EC2 → キーペア → 「キーペアを作成」
2. 名前: `image-upload-bastion`、形式: `.pem` を選択して作成
3. ダウンロードされた `.pem` ファイルを `~/.ssh/` に移動
4. `chmod 400 ~/.ssh/image-upload.pem` でパーミッションを設定

### SSHでの接続

```bash
# 踏み台サーバーへ直接接続
ssh -i "~/.ssh/image-upload.pem" ec2-user@[踏み台サーバーのパブリックIP]
```

Terraform の出力値（`terraform output`）からパブリックIPを確認できます：

```bash
cd packages/infra
terraform output bastion_public_ip
```

### SSHトンネル経由でのRDS接続

RDSはプライベートサブネットにあるため、踏み台サーバー経由でポートフォワーディングします。

```bash
# ローカルの 5433 ポートを RDS の 5432 にフォワード（接続を維持）
ssh -i "~/.ssh/image-upload.pem" \
  -L 5433:[RDSエンドポイント]:5432 \
  ec2-user@[踏み台サーバーのパブリックIP] \
  -N
```

別ターミナルで接続確認：

```bash
psql -h localhost -p 5433 -U postgres -d imageupload
```

## デプロイ後の確認

1. **CloudFrontドメイン**にアクセスしてフロントエンドが表示されるか確認
2. **APIエンドポイント**が応答するか確認
3. **画像アップロード**機能が動作するか確認
4. **CloudWatch**でエラーログがないか確認

## 注意事項

- デプロイ前にAWS認証情報を設定してください
- データベースのパスワードは安全なものを使用してください（英数字のみ推奨）
- 本番環境ではIAMロールとユーザーの権限を適切に設定してください
- 個人開発のためローカル状態ファイルを使用します。チーム開発の場合はS3バックエンドの導入を検討してください
- 秘密鍵（`.pem`）はバージョン管理に含めないでください（`.gitignore` に追加すること）
