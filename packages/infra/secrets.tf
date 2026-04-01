# Secrets Module
module "secrets" {
  source = "./modules/secrets"

  project_name          = var.project_name
  db_username           = var.db_username
  db_password           = var.db_password
  db_endpoint           = module.rds.db_instance_endpoint
  db_name               = var.db_name
  lambda_function_name   = module.api.lambda_function_name
  rds_instance_id       = module.rds.db_instance_id
}
