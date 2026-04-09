output "lambda_security_group_id" {
  description = "Lambda Security Group ID"
  value       = aws_security_group.lambda.id
}

output "bastion_security_group_id" {
  description = "Bastion Security Group ID"
  value       = aws_security_group.bastion.id
}
