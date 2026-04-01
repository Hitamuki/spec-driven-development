# API Module
module "api" {
  source = "./modules/api"

  project_name                = var.project_name
  lambda_security_group_id    = aws_security_group.lambda.id
  private_subnet_ids          = module.vpc.private_subnet_ids
  aws_region                  = var.aws_region
  image_storage_bucket_name   = module.s3.image_storage_bucket_name
  image_storage_bucket_arn    = module.s3.image_storage_bucket_arn
  db_instance_arn             = module.rds.db_instance_arn
  db_secret_arn               = module.secrets.db_secret_arn
  db_username                 = var.db_username
  db_password                 = var.db_password
  db_endpoint                 = module.rds.db_instance_endpoint
  db_name                     = var.db_name
}
