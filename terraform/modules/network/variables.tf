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

variable "subnet_cidr" {
  description = "The CIDR range for the subnet"
  type        = string
  default     = "10.0.0.0/20"
}

variable "secondary_ip_range_services" {
  description = "The CIDR range for services"
  type        = string
  default     = "10.1.0.0/20"
}

variable "secondary_ip_range_pods" {
  description = "The CIDR range for pods"
  type        = string
  default     = "10.2.0.0/16"
}