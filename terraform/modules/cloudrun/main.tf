resource "google_cloud_run_service" "backend" {
  name     = "${var.app_name}-${var.environment}-backend"
  location = var.region

  template {
    spec {
      containers {
        image = var.backend_image

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        env {
          name  = "PORT"
          value = "8080"
        }

        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        env {
          name  = "MONGODB_URI"
          value = var.mongodb_uri
        }

        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.jwt_secret.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name  = "STORAGE_PROVIDER"
          value = "gcs"
        }

        env {
          name  = "GOOGLE_CLOUD_PROJECT_ID"
          value = var.project_id
        }

        env {
          name  = "GOOGLE_CLOUD_BUCKET_NAME"
          value = var.storage_bucket_name
        }
      }

      service_account_name = google_service_account.cloudrun_service_account.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_secret_manager_secret_version.jwt_secret
  ]
}

resource "google_service_account" "cloudrun_service_account" {
  account_id   = "${var.app_name}-${var.environment}-cloudrun"
  display_name = "Cloud Run Service Account for ${var.app_name} ${var.environment}"
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "${var.app_name}-${var.environment}-jwt-secret"
  
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret = google_secret_manager_secret.jwt_secret.id
  
  secret_data = var.jwt_secret
}

resource "google_secret_manager_secret_iam_member" "secret_access" {
  secret_id = google_secret_manager_secret.jwt_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_service_account.email}"
}

resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_service.backend.location
  service  = google_cloud_run_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Run domain mapping
resource "google_cloud_run_domain_mapping" "backend" {
  count    = var.domain_name != "" ? 1 : 0
  location = var.region
  name     = var.domain_name

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_service.backend.name
  }
}