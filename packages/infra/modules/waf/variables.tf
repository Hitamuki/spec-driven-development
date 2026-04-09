variable "project_name" {
  type        = string
  description = "Project name"
}

variable "rate_limit_per_ip" {
  type        = number
  default     = 2000
  description = "Rate limit per IP address"
}

variable "scope" {
  type        = string
  default     = "CLOUDFRONT"
  description = "Scope of the Web ACL (CLOUDFRONT or REGIONAL)"

  validation {
    condition     = contains(["CLOUDFRONT", "REGIONAL"], var.scope)
    error_message = "Scope must be either CLOUDFRONT or REGIONAL"
  }
}
