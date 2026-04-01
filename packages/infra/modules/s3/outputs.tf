output "static_assets_bucket_name" {
  description = "Static assets S3 bucket name"
  value       = aws_s3_bucket.static_assets.id
}

output "static_assets_bucket_arn" {
  description = "Static assets S3 bucket ARN"
  value       = aws_s3_bucket.static_assets.arn
}

output "image_storage_bucket_name" {
  description = "Image storage S3 bucket name"
  value       = aws_s3_bucket.image_storage.id
}

output "image_storage_bucket_arn" {
  description = "Image storage S3 bucket ARN"
  value       = aws_s3_bucket.image_storage.arn
}

output "static_assets_bucket_regional_domain_name" {
  description = "Regional domain name of the static assets bucket"
  value       = aws_s3_bucket.static_assets.bucket_regional_domain_name
}
