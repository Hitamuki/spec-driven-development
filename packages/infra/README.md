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

```text
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
- PC環境によっては、Terraform実行前にクロスアカウント（`arn:aws:iam::866645635048:role/Hitamuki`）で AWS CLI を実行すること

クロスアカウントで実行する場合（手動デプロイ前に実行）:

パターンA: プロファイルを使う方法（推奨）

```bash
# 1) クロスアカウント用プロファイルを作成
aws configure set profile.image-upload-cross.role_arn arn:aws:iam::866645635048:role/Hitamuki
aws configure set profile.image-upload-cross.source_profile default
aws configure set profile.image-upload-cross.region ap-northeast-1

# 2) このシェルでクロスアカウントを利用
export AWS_PROFILE=image-upload-cross

# 3) 実行先アカウントを確認（866645635048 になっていること）
aws sts get-caller-identity
```

パターンB: aws sts assume-role を直接使う方法

```bash
# 1) 一時クレデンシャルを取得
read AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN <<< "$(aws sts assume-role \
   --role-arn arn:aws:iam::866645635048:role/Hitamuki \
   --role-session-name local-actions \
   --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
   --output text)"

# 2) このシェルに一時クレデンシャルを設定
export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
export AWS_DEFAULT_REGION=ap-northeast-1

# 3) 実行先アカウントを確認（866645635048 になっていること）
aws sts get-caller-identity
```

### 1. BackendコードのビルドとLambdaアーティファクト配置（手動）

Backend（Lambda）は 手動でビルドしたアーティファクトをS3へ配置します。

例（手動実行）:

```bash
cd apps/backend
pnpm run build:lambda
cd dist
# Zip化
zip -r ../main.zip .
# 初回のみ: アーティファクト格納用バケットを作成
aws s3api create-bucket --bucket [lambda-artifact-bucket] --region ap-northeast-1 --create-bucket-configuration LocationConstraint=ap-northeast-1
# 初回のみ(推奨): バージョニングを有効化
aws s3api put-bucket-versioning --bucket [lambda-artifact-bucket] --versioning-configuration Status=Enabled
# 初回のみ(推奨): 公開ブロックを有効化
aws s3api put-public-access-block --bucket [lambda-artifact-bucket] --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
# S3へアップロード（`apps/backend`で）
aws s3 cp main.zip s3://[lambda-artifact-bucket]/backend/main.zip
```

`pnpm build` は Bun 実行用のビルドです。Lambda (nodejs22.x) へ配置するアーティファクトは `pnpm run build:lambda` を使ってください。

`terraform.tfvars` には 配置したS3の場所を設定してください。

`allowed_origins` に設定するオリジンは末尾スラッシュなし（例: `https://d12t3qn6pzulc.cloudfront.net`）で指定してください。

```hcl
lambda_artifact_bucket = "image-upload-deploy-artifacts"
lambda_artifact_key    = "backend/main.zip"
```

### 2. Terraformの初期化と実行

```bash
cd packages/infra
terraform init
terraform plan
terraform apply
```

```bash
# オブジェクトの VersionId を取得
aws s3api head-object --bucket [lambda-artifact-bucket] --key [zipのパス] --query VersionId --output text
```

`terraform.tfvars`を更新

```bash
# 更新
terraform apply
```

### 3. データベーススキーマの設定 (Prisma)

RDSはプライベートサブネットにあるため、踏み台サーバー経由でSSHトンネルを張る必要があります。
踏み台サーバーへの接続方法は [「踏み台サーバーへの接続」](#踏み台サーバーへの接続) を参照してください。

踏み台EC2はデフォルトで停止状態を維持し、DB作業時のみ一時的に起動してください。

1. **踏み台EC2の起動**

   ```bash
   cd packages/infra
   terraform output bastion_instance_id
   aws ec2 start-instances --instance-ids [bastion_instance_id]
   aws ec2 wait instance-running --instance-ids [bastion_instance_id]
   ```

2. **踏み台サーバーのパブリックIPを確認**

   ```bash
   aws ec2 describe-instances \
     --instance-ids [bastion_instance_id] \
     --query "Reservations[0].Instances[0].PublicIpAddress" \
     --output text
   ```

3. **SSHトンネルの作成**（別ターミナルで実行し、接続を維持したまま次の手順へ）

   ```bash
   ssh -i ~/.ssh/[pem名] -L 5433:[RDSインスタンスのエンドポイント]:5432 ubuntu@[踏み台サーバーのパブリックIP] -N
   ```

4. **.env の設定**
   `packages/db/.env` をローカル転送用のアドレスに書き換えます。

   ```text
   # パスワードは英数字のみ（記号なし）を使用してください
   DATABASE_URL="postgresql://<ユーザー名>:<パスワード>@localhost:5433/<DB名>"
   ```

5. **マイグレーションの実行**

   ```bash
   cd packages/db
   pnpm prisma migrate deploy
   pnpm prisma generate
   ```

6. **作業終了後は踏み台EC2を停止**

   ```bash
   aws ec2 stop-instances --instance-ids [bastion_instance_id]
   aws ec2 wait instance-stopped --instance-ids [bastion_instance_id]
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
psql -h localhost -p 5433 -U hitamuki -d imageupload
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

## TBD

### 踏み台サーバーを SSM Session Manager に移行する

- 目的は、SSH公開を廃止して 22/TCP への到達性をなくし、秘密鍵配布と保管の運用を不要にすることです。
- 移行後は、踏み台の接続手順を SSH ベースから SSM ベースへ置き換えます。
- 移行完了後は、踏み台用セキュリティグループから 22/TCP の受信許可を削除します。

### 現状のリスク

- 現在の踏み台サーバーは SSH を前提としており、22/TCP の公開と公開IP付与に起因する攻撃面が残っています。
- 踏み台を必要時のみ起動する運用は露出時間の短縮に有効ですが、構成上のリスク自体は解消しません。
- DB作業で秘密鍵を扱うため、端末保護や鍵管理が不十分だと踏み台経由でRDSに到達される可能性があります。

### 当面の運用上の注意

- 踏み台EC2は原則 stopped を維持し、DB作業の直前にのみ起動してください。
- 作業完了後は、SSHトンネルを終了したうえで EC2 を停止してください。
- SSH接続元は可能であれば固定IPに制限し、鍵ファイルはローカル端末の安全な領域だけで管理してください。
- 中長期的には、SSM Session Manager への移行を完了させて SSH 運用を廃止してください。
