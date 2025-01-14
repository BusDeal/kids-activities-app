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

variable "storage_class" {
  description = "The storage class for the bucket"
  type        = string
}

variable "allowed_origin" {
  description = "The allowed origin for CORS"
  type        = string
}

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

