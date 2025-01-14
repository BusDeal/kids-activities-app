variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "environment" {
  description = "The deployment environment"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "backend_image" {
  description = "The Docker image for the backend service"
  type        = string
}

variable "mongodb_uri" {
  description = "The MongoDB connection URI"
  type        = string
}

variable "jwt_secret" {
  description = "The secret key for JWT tokens"
  type        = string
}

variable "storage_bucket_name" {
  description = "The name of the GCS bucket"
  type        = string
}

variable "domain_name" {
  description = "The domain name for the service"
  type        = string
  default     = ""
}

variable "gcp_credentials_base64" {
  description = "Base64-encoded GCP service account key JSON"
  type        = string
}