# API Module
module "api" {
  source = "./modules/api"

  project_name                   = var.project_name
  lambda_artifact_bucket         = var.lambda_artifact_bucket
  lambda_artifact_key            = var.lambda_artifact_key
  lambda_artifact_object_version = var.lambda_artifact_object_version
  lambda_source_code_hash        = var.lambda_source_code_hash
  lambda_security_group_id       = module.security_groups.lambda_security_group_id
  private_subnet_ids             = module.vpc.private_subnet_ids
  aws_region                     = var.aws_region
  image_storage_bucket_name      = module.s3.image_storage_bucket_name
  image_storage_bucket_arn       = module.s3.image_storage_bucket_arn
  db_instance_arn                = module.rds.db_instance_arn
  db_secret_arn                  = module.secrets.db_secret_arn
  db_username                    = var.db_username
  db_password                    = var.db_password
  db_endpoint                    = module.rds.db_instance_endpoint
  db_name                        = var.db_name
  origin_verify_secret           = random_password.origin_verify_secret.result
}
