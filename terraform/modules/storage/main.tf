resource "google_storage_bucket" "app_storage" {
  name          = "${var.app_name}-${var.environment}-storage"
  location      = var.region
  storage_class = var.storage_class

  uniform_bucket_level_access = true
  force_destroy              = var.environment != "prod"

  cors {
    origin          = [var.allowed_origin]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  versioning {
    enabled = var.environment == "prod"
  }
}

resource "google_storage_bucket_iam_member" "app_storage_viewer" {
  bucket = google_storage_bucket.app_storage.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_service_account" "storage_account" {
  account_id   = "${var.app_name}-${var.environment}-storage"
  display_name = "Storage Service Account for ${var.app_name} ${var.environment}"
}

resource "google_storage_bucket_iam_member" "storage_admin" {
  bucket = google_storage_bucket.app_storage.name
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.storage_account.email}"
}

resource "google_service_account_key" "storage_account_key" {
  service_account_id = google_service_account.storage_account.name
}