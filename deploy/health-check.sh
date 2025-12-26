#!/bin/bash

# Health Check Script for ANCS
# This script checks if all services are running properly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
NGINX_URL="${NGINX_URL:-http://localhost}"

# Counters
PASSED=0
FAILED=0

# Function to check service
check_service() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response, expected $expected_code)"
        ((FAILED++))
        return 1
    fi
}

# Function to check database connection
check_database() {
    echo -n "Checking database connection... "
    
    if docker compose exec -T backend python manage.py check --database default &> /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

# Function to check Docker containers
check_containers() {
    echo -e "\n${YELLOW}Docker Container Status:${NC}"
    docker compose ps
    echo ""
}

echo "==================================="
echo "  ANCS Health Check"
echo "==================================="
echo ""

# Check if Docker is being used
if command -v docker &> /dev/null && docker compose ps &> /dev/null; then
    check_containers
    
    # Check database
    check_database
    
    # Check backend through nginx
    check_service "Backend API (via Nginx)" "$NGINX_URL/api/health/" 200
    
    # Check frontend
    check_service "Frontend (via Nginx)" "$NGINX_URL/" 200
else
    # Check services directly
    check_service "Backend API" "$BACKEND_URL/api/health/" 200
    check_service "Frontend" "$FRONTEND_URL/" 200
fi

# Summary
echo ""
echo "==================================="
echo "  Summary"
echo "==================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "==================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed! ✗${NC}"
    exit 1
fi
