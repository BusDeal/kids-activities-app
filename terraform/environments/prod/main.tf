provider "google" {
  project = var.project_id
  region  = var.region
}

module "network" {
  source = "../../modules/network"

  app_name    = var.app_name
  environment = var.environment
  region      = var.region
}


module "storage" {
  source = "../../modules/storage"

  app_name       = var.app_name
  environment    = var.environment
  region         = var.region
  storage_class  = var.storage_class
  allowed_origin = "https://${var.domain_name}"
  project_id     = var.project_id
}

module "cloudrun" {
  source = "../../modules/cloudrun"

  app_name            = var.app_name
  environment         = var.environment
  region             = var.region
  project_id         = var.project_id
  backend_image      = "gcr.io/${var.project_id}/${var.app_name}-backend:latest"
  mongodb_uri        = "mongodb+srv://vidyasagarkota:0xKEPb92mf71YPWM@cluster0.mww1w.mongodb.net/kids-activities?retryWrites=true&w=majority&appName=Cluster0"
  jwt_secret             = random_password.jwt_secret.result
  storage_bucket_name     = module.storage.bucket_name
  domain_name            = var.domain_name
  gcp_credentials_base64 = base64encode(file("${path.module}/../../service-account-key.json"))

  depends_on = [
    module.network,
    module.storage
  ]
}

# Grant Cloud Run service account access to Cloud Storage
resource "google_storage_bucket_iam_member" "cloudrun_storage_admin" {
  bucket = module.storage.bucket_name
  role   = "roles/storage.admin"
  member = "serviceAccount:${module.cloudrun.service_account_email}"
}

resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}