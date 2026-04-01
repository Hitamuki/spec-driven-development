# CloudFront Module
module "cloudfront" {
  source = "./modules/cloudfront"

  project_name                 = var.project_name
  static_assets_bucket_name   = module.s3.static_assets_bucket_name
  static_assets_bucket_domain_name = module.s3.static_assets_bucket_regional_domain_name
  api_gateway_id              = module.api.api_gateway_id
  api_gateway_domain_name     = replace(module.api.api_gateway_domain_name, "https://", "")
}
