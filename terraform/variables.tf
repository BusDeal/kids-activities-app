variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The default GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "The deployment environment (e.g., prod, staging)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "The name of the application"
  type        = string
  default     = "kids-activities"
}

variable "domain_name" {
  description = "The domain name for the application"
  type        = string
}

variable "mongodb_version" {
  description = "MongoDB version"
  type        = string
  default     = "4.4"
}

variable "mongodb_instance_tier" {
  description = "MongoDB instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "storage_class" {
  description = "Storage class for the GCS bucket"
  type        = string
  default     = "STANDARD"
}