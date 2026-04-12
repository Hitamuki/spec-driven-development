# RDS Module
module "rds" {
  source = "./modules/rds"

  project_name              = var.project_name
  vpc_id                    = module.vpc.vpc_id
  private_subnet_ids        = module.vpc.private_subnet_ids
  db_name                   = var.db_name
  db_username               = var.db_username
  db_password               = var.db_password
  lambda_security_group_id  = module.security_groups.lambda_security_group_id
  bastion_security_group_id = module.security_groups.bastion_security_group_id
}
