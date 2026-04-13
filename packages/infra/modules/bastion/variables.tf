variable "project_name" {
  type        = string
  description = "Project name"
}

variable "public_subnet_id" {
  type        = string
  description = "Public subnet ID for Bastion"
}

variable "bastion_security_group_id" {
  type        = string
  description = "Security group ID for Bastion"
}

variable "ami_id" {
  type        = string
  default     = "ami-0d52744d6551d851e" # Amazon Linux 2023 in ap-northeast-1
  description = "AMI ID for Bastion Host"
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "EC2 instance type for Bastion"
}

variable "key_name" {
  type        = string
  default     = ""
  description = "Key pair name for SSH access (optional)"
}

variable "instance_desired_state" {
  type        = string
  default     = "stopped"
  description = "Desired EC2 state for Bastion Host: running or stopped"

  validation {
    condition     = contains(["running", "stopped"], var.instance_desired_state)
    error_message = "instance_desired_state must be running or stopped."
  }
}
