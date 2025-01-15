locals {
  backend_image = "gcr.io/${var.project_id}/${var.app_name}-backend:latest"
}

module "network" {
  source = "./modules/network"

  app_name    = var.app_name
  environment = var.environment
  region      = var.region
}

module "storage" {
  source = "./modules/storage"

  app_name       = var.app_name
  environment    = var.environment
  region         = var.region
  storage_class  = var.storage_class
  allowed_origin = "https://${var.domain_name}"
}

module "cloudrun" {
  source = "./modules/cloudrun"

  app_name           = var.app_name
  environment        = var.environment
  region            = var.region
  project_id        = var.project_id
  backend_image     = local.backend_image
  mongodb_uri       = "mongodb+srv://vidyasagarkota:0xKEPb92mf71YPWM @cluster0.mww1w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"  # Replace with actual MongoDB URI
  jwt_secret        = random_password.jwt_secret.result
  storage_bucket_name = module.storage.bucket_name
  domain_name       = var.domain_name

  depends_on = [
    module.network,
    module.storage
  ]
}

# Generate a random JWT secret
resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}

# Output the necessary values
output "backend_url" {
  value = module.cloudrun.service_url
}

output "storage_bucket" {
  value = module.storage.bucket_name
}

output "service_account_key" {
  value     = module.storage.service_account_key
  sensitive = true
}