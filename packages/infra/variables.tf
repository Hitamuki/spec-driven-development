variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "assume_role_arn" {
  description = "クロスアカウント実行に使用するIAMロールARN"
  type        = string
  default     = "arn:aws:iam::866645635048:role/Hitamuki"
}

variable "assume_role_session_name" {
  description = "AssumeRole実行時のセッション名"
  type        = string
  default     = "local-actions"
}

variable "environment" {
  description = "環境名"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "プロジェクト名"
  type        = string
  default     = "image-upload"
}

variable "key_name" {
  description = "踏み台サーバー接続用のEC2キーペア名（任意）"
  type        = string
  default     = ""
}

variable "bastion_instance_desired_state" {
  description = "踏み台EC2の希望状態（running または stopped）"
  type        = string
  default     = "stopped"

  validation {
    condition     = contains(["running", "stopped"], var.bastion_instance_desired_state)
    error_message = "bastion_instance_desired_state は running か stopped を指定してください。"
  }
}

variable "lambda_artifact_bucket" {
  description = "Lambdaデプロイ用アーティファクトを格納するS3バケット名"
  type        = string
}

variable "lambda_artifact_key" {
  description = "Lambdaデプロイ用アーティファクトのS3キー（zip）"
  type        = string
}

variable "lambda_artifact_object_version" {
  description = "Lambdaデプロイ用アーティファクトのS3オブジェクトバージョン（任意）"
  type        = string
  default     = null
}

variable "lambda_source_code_hash" {
  description = "Lambda更新検知用のBase64エンコード済みSHA-256ハッシュ（任意）"
  type        = string
  default     = null
}

variable "domain_name" {
  description = "ドメイン名"
  type        = string
  default     = ""
}

variable "allowed_origins" {
  description = "CORSで許可するオリジン"
  type        = list(string)
  default     = ["http://localhost:3000", "https://localhost:3000"]
}

variable "db_name" {
  description = "データベース名"
  type        = string
  default     = "imageupload"
}

variable "db_username" {
  description = "データベースユーザー名"
  type        = string
  default     = "hitamuki"
}

variable "db_password" {
  description = "データベースパスワード"
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^[a-zA-Z0-9]+$", var.db_password))
    error_message = "PrismaのDATABASE_URLパースエラーを防ぐため、パスワードは英数字のみで入力してください（記号は使用できません）。"
  }
}
