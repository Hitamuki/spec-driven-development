variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "static_assets_bucket_name" {
  description = "Static assets S3 bucket name"
  type        = string
}

variable "static_assets_bucket_domain_name" {
  description = "Static assets S3 bucket domain name"
  type        = string
}

variable "api_gateway_id" {
  description = "API Gateway ID"
  type        = string
}

variable "api_gateway_domain_name" {
  description = "API Gateway domain name"
  type        = string
}
