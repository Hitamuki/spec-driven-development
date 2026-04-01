variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "allowed_origins" {
  description = "CORSで許可するオリジン"
  type        = list(string)
}
