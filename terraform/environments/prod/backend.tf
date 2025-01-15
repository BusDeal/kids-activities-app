terraform {
  backend "gcs" {
    bucket = "kids-activities-terraform-state"
    prefix = "terraform/state"
  }
}