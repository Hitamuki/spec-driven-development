variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "imageupload"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "hitamuki"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "lambda_security_group_id" {
  description = "Security group ID of the Lambda function to allow access"
  type        = string
}
