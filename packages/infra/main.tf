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
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "image-upload"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Lambda Security Group (Defined at root to avoid circular dependency between API and RDS)
resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-lambda-sg"
  description = "Security group for API Lambda"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-lambda-sg"
  }
}

# Bastion Host Security Group
resource "aws_security_group" "bastion" {
  name        = "${var.project_name}-bastion-sg"
  description = "Security group for Bastion Host"
  vpc_id      = module.vpc.vpc_id

  # Allow SSH from anywhere (Change to your IP for better security)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-bastion-sg"
  }
}

# Bastion Host (EC2 Instance)
resource "aws_instance" "bastion" {
  ami           = "ami-0d52744d6551d851e" # Amazon Linux 2023 in ap-northeast-1
  instance_type = "t3.micro"

  # Must be in a public subnet to be accessible from internet
  subnet_id                   = module.vpc.public_subnet_ids[0]
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true

  # key_name = "your-key-name" # 事前に作成したキーペア名を指定してください

  tags = {
    Name = "${var.project_name}-bastion"
  }
}
