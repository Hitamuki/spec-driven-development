output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_gateway_arn" {
  description = "API Gateway ARN"
  value       = aws_api_gateway_rest_api.main.arn
}

output "api_gateway_domain_name" {
  description = "API Gateway domain name"
  value       = "${aws_api_gateway_rest_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.api.arn
}

output "lambda_security_group_id" {
  description = "Security group ID of the Lambda function"
  value       = var.lambda_security_group_id
}
