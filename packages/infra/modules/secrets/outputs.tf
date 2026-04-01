output "db_secret_arn" {
  description = "Database credentials secret ARN"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "db_secret_name" {
  description = "Database credentials secret name"
  value       = aws_secretsmanager_secret.db_credentials.name
}

output "sns_topic_arn" {
  description = "SNS topic ARN for alarms"
  value       = aws_sns_topic.alarms.arn
}
