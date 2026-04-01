# S3 Module
module "s3" {
  source = "./modules/s3"

  project_name    = var.project_name
  allowed_origins = var.allowed_origins
}
