variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "lambda_security_group_id" {
  description = "Security group ID for the Lambda function"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for Lambda VPC config"
  type        = list(string)
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
}

variable "image_storage_bucket_name" {
  description = "Image storage S3 bucket name"
  type        = string
}

variable "image_storage_bucket_arn" {
  description = "Image storage S3 bucket ARN"
  type        = string
}

variable "db_instance_arn" {
  description = "RDS instance ARN"
  type        = string
}

variable "db_secret_arn" {
  description = "Database secret ARN"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_endpoint" {
  description = "Database endpoint"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "origin_verify_secret" {
  description = "CloudFront から API Gateway へのリクエスト検証用シークレット"
  type        = string
  sensitive   = true
}
