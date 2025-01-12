output "bucket_name" {
  description = "The name of the storage bucket"
  value       = google_storage_bucket.app_storage.name
}

output "bucket_url" {
  description = "The URL of the storage bucket"
  value       = google_storage_bucket.app_storage.url
}

output "service_account_email" {
  description = "The email of the service account"
  value       = google_service_account.storage_account.email
}

output "service_account_key" {
  description = "The key for the service account"
  value       = google_service_account_key.storage_account_key.private_key
  sensitive   = true
}