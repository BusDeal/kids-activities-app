resource "google_compute_network" "vpc" {
  name                    = "${var.app_name}-${var.environment}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "${var.app_name}-${var.environment}-subnet"
  ip_cidr_range = var.subnet_cidr
  network       = google_compute_network.vpc.id
  region        = var.region

  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "services-range"
    ip_cidr_range = var.secondary_ip_range_services
  }

  secondary_ip_range {
    range_name    = "pod-ranges"
    ip_cidr_range = var.secondary_ip_range_pods
  }
}

resource "google_compute_firewall" "allow_internal" {
  name    = "${var.app_name}-${var.environment}-allow-internal"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
  }
  allow {
    protocol = "udp"
  }
  allow {
    protocol = "icmp"
  }

  source_ranges = [var.subnet_cidr]
}

resource "google_compute_router" "router" {
  name    = "${var.app_name}-${var.environment}-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "${var.app_name}-${var.environment}-nat"
  router                            = google_compute_router.router.name
  region                            = var.region
  nat_ip_allocate_option            = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}