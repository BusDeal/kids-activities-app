resource "google_service_account" "cloudrun_service_account" {
  account_id   = "${var.app_name}-${var.environment}-cloudrun"
  display_name = "Cloud Run Service Account for ${var.app_name} ${var.environment}"
}

resource "google_service_account_key" "cloudrun_service_account_key" {
  service_account_id = google_service_account.cloudrun_service_account.name
}