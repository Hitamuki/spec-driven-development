# S3 Bucket for Static Assets (SPA)
resource "aws_s3_bucket" "static_assets" {
  bucket = "${var.project_name}-static-assets-${random_string.suffix.result}"

  tags = {
    Name = "${var.project_name}-static-assets"
    Type = "static-assets"
  }
}

resource "aws_s3_bucket_versioning" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket for Image Storage
resource "aws_s3_bucket" "image_storage" {
  bucket = "${var.project_name}-images-${random_string.suffix.result}"

  tags = {
    Name = "${var.project_name}-images"
    Type = "image-storage"
  }
}

resource "aws_s3_bucket_versioning" "image_storage" {
  bucket = aws_s3_bucket.image_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "image_storage" {
  bucket = aws_s3_bucket.image_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "image_storage" {
  bucket = aws_s3_bucket.image_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CORS Configuration for Image Storage
resource "aws_s3_bucket_cors_configuration" "image_storage" {
  bucket = aws_s3_bucket.image_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    # S3のCORS判定は厳密一致のため、末尾スラッシュを除去して保存する
    allowed_origins = [for origin in var.allowed_origins : trimsuffix(origin, "/")]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Random suffix for unique bucket names
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}
