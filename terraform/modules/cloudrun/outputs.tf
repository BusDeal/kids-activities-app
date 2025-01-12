output "service_url" {
  description = "The URL of the deployed service"
  value       = google_cloud_run_service.backend.status[0].url
}

output "service_name" {
  description = "The name of the Cloud Run service"
  value       = google_cloud_run_service.backend.name
}

output "service_account_email" {
  description = "The email of the service account"
  value       = google_service_account.cloudrun_service_account.email
}