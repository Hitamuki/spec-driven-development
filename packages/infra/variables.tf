variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
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
  default     = "postgres"
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
