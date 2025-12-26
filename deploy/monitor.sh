#!/bin/bash

# ANCS Monitoring Script
# This script monitors the health and resource usage of ANCS services

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
LOG_FILE="${LOG_FILE:-/var/log/ancs-monitor.log}"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check service health
check_service() {
    local service=$1
    local url=$2
    
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $service is healthy${NC}"
        log "INFO: $service is healthy"
        return 0
    else
        echo -e "${RED}✗ $service is DOWN${NC}"
        log "ERROR: $service is DOWN"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    local threshold=80
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt "$threshold" ]; then
        echo -e "${GREEN}✓ Disk space: ${usage}% used${NC}"
        log "INFO: Disk space at ${usage}%"
    else
        echo -e "${RED}⚠ WARNING: Disk space critically low: ${usage}% used${NC}"
        log "WARNING: Disk space at ${usage}%"
    fi
}

# Function to check memory usage
check_memory() {
    local threshold=80
    local usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    
    if [ "$usage" -lt "$threshold" ]; then
        echo -e "${GREEN}✓ Memory: ${usage}% used${NC}"
        log "INFO: Memory usage at ${usage}%"
    else
        echo -e "${YELLOW}⚠ WARNING: High memory usage: ${usage}%${NC}"
        log "WARNING: High memory usage at ${usage}%"
    fi
}

# Function to check Docker containers
check_containers() {
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠ Docker not found, skipping container checks${NC}"
        return
    fi
    
    echo ""
    echo -e "${YELLOW}=== Docker Container Status ===${NC}"
    
    if docker compose -f "$COMPOSE_FILE" ps 2>/dev/null; then
        # Check if all services are running
        local running=$(docker compose -f "$COMPOSE_FILE" ps | grep -c "Up" || echo "0")
        local total=$(docker compose -f "$COMPOSE_FILE" config --services | wc -l)
        
        if [ "$running" -eq "$total" ]; then
            echo -e "${GREEN}✓ All containers running ($running/$total)${NC}"
            log "INFO: All containers running ($running/$total)"
        else
            echo -e "${RED}✗ Some containers are down ($running/$total)${NC}"
            log "ERROR: Some containers are down ($running/$total)"
        fi
    else
        echo -e "${YELLOW}⚠ Docker Compose not running${NC}"
    fi
}

# Function to check database size
check_database_size() {
    if docker compose -f "$COMPOSE_FILE" ps db &> /dev/null; then
        local db_size=$(docker compose -f "$COMPOSE_FILE" exec -T db psql -U "${POSTGRES_USER:-ancs_user}" -d "${POSTGRES_DB:-ancs_db}" -t -c "SELECT pg_size_pretty(pg_database_size('${POSTGRES_DB:-ancs_db}'));" 2>/dev/null | xargs)
        
        if [ -n "$db_size" ]; then
            echo -e "${GREEN}✓ Database size: $db_size${NC}"
            log "INFO: Database size: $db_size"
        fi
    fi
}

# Main monitoring
echo "==================================="
echo "  ANCS System Monitor"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "==================================="
echo ""

# System resources
echo -e "${YELLOW}=== System Resources ===${NC}"
check_disk_space
check_memory
echo ""

# Docker containers
check_containers
echo ""

# Database
echo -e "${YELLOW}=== Database ===${NC}"
check_database_size
echo ""

# Service health checks
echo -e "${YELLOW}=== Service Health ===${NC}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost}"

check_service "Backend API" "$BACKEND_URL/api/health/" || true
check_service "Frontend" "$FRONTEND_URL/" || true
echo ""

# Recent errors in logs (if using Docker)
if docker compose -f "$COMPOSE_FILE" ps backend &> /dev/null; then
    echo -e "${YELLOW}=== Recent Backend Errors ===${NC}"
    docker compose -f "$COMPOSE_FILE" logs --tail=10 backend 2>/dev/null | grep -i error || echo "No recent errors"
    echo ""
fi

echo "==================================="
echo -e "${GREEN}Monitoring complete!${NC}"
echo "==================================="

# Exit with error if any critical checks failed
# (for use in cron jobs or alerting systems)
