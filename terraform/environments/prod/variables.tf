variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The default GCP region"
  type        = string
}

variable "environment" {
  description = "The deployment environment"
  type        = string
}

variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "domain_name" {
  description = "The domain name for the application"
  type        = string
}

variable "storage_class" {
  description = "Storage class for the GCS bucket"
  type        = string
}