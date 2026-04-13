terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "aws" {
  region = var.aws_region

  assume_role {
    role_arn     = var.assume_role_arn
    session_name = var.assume_role_session_name
  }

  default_tags {
    tags = {
      Project     = "image-upload"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# CloudFront → API Gateway 間の Origin 検証用シークレット
resource "random_password" "origin_verify_secret" {
  length  = 32
  special = false
}

# Security Groups Module
module "security_groups" {
  source = "./modules/security-groups"

  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
}

# Bastion Module
module "bastion" {
  source = "./modules/bastion"

  project_name              = var.project_name
  public_subnet_id          = module.vpc.public_subnet_ids[0]
  bastion_security_group_id = module.security_groups.bastion_security_group_id
  key_name                  = var.key_name
  instance_desired_state    = var.bastion_instance_desired_state
}
