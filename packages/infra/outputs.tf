# VPC Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

# S3 Outputs
output "static_assets_bucket_name" {
  description = "Static assets S3 bucket name"
  value       = module.s3.static_assets_bucket_name
}

output "image_storage_bucket_name" {
  description = "Image storage S3 bucket name"
  value       = module.s3.image_storage_bucket_name
}

# RDS Outputs
output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.db_instance_endpoint
}

output "db_instance_id" {
  description = "RDS instance ID"
  value       = module.rds.db_instance_id
}

# API Gateway Outputs
output "api_gateway_invoke_url" {
  description = "API Gateway invoke URL"
  value       = module.api.api_gateway_domain_name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.api.lambda_function_name
}

# CloudFront Outputs
output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.cloudfront_domain_name
}

# Secrets Outputs
output "db_secret_arn" {
  description = "Database credentials secret ARN"
  value       = module.secrets.db_secret_arn
}
