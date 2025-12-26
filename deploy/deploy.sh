#!/bin/bash

# ANCS Deployment Script
# This script helps deploy the ANCS application using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_info "Please copy .env.example to .env and configure it"
    print_info "  cp .env.example .env"
    exit 1
fi

# Check if frontend/.env file exists
if [ ! -f frontend/.env ]; then
    print_error "frontend/.env file not found!"
    print_info "Please copy frontend/.env.example to frontend/.env and configure it"
    print_info "  cp frontend/.env.example frontend/.env"
    exit 1
fi

# Parse command line arguments
MODE=${1:-prod}
COMPOSE_FILE="docker-compose.yml"

if [ "$MODE" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    print_info "Using production configuration"
else
    print_info "Using development configuration"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_info "Starting deployment with $COMPOSE_FILE..."

# Stop existing containers
print_info "Stopping existing containers..."
docker compose -f $COMPOSE_FILE down

# Build and start containers
print_info "Building and starting containers..."
docker compose -f $COMPOSE_FILE up -d --build

# Wait for database to be ready
print_info "Waiting for database to be ready..."
sleep 10

# Run migrations
print_info "Running database migrations..."
docker compose -f $COMPOSE_FILE exec -T backend python manage.py migrate

# Collect static files
print_info "Collecting static files..."
docker compose -f $COMPOSE_FILE exec -T backend python manage.py collectstatic --noinput

# Check if superuser creation is needed
print_info "To create a superuser, run:"
print_info "  docker compose -f $COMPOSE_FILE exec backend python manage.py createsuperuser"

# Show status
print_info "Deployment complete! Checking container status..."
docker compose -f $COMPOSE_FILE ps

# Show logs
print_info "\nTo view logs, run:"
print_info "  docker compose -f $COMPOSE_FILE logs -f"

print_info "\n${GREEN}Deployment successful!${NC}"
print_info "Application is running at:"
print_info "  - Frontend: http://localhost"
print_info "  - Backend API: http://localhost/api"
print_info "  - Admin Panel: http://localhost/admin"
