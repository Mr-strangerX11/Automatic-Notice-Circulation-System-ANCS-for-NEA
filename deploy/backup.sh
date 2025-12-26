#!/bin/bash

# ANCS Database Backup Script
# This script creates a backup of the PostgreSQL database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
RETENTION_DAYS=${RETENTION_DAYS:-7}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting database backup...${NC}"

# Check if running with Docker Compose
if docker compose -f "$COMPOSE_FILE" ps db &> /dev/null; then
    # Docker Compose backup
    BACKUP_FILE="$BACKUP_DIR/ancs_backup_$TIMESTAMP.sql"
    
    echo -e "${YELLOW}Creating database backup: $BACKUP_FILE${NC}"
    
    docker compose -f "$COMPOSE_FILE" exec -T db pg_dump -U "${POSTGRES_USER:-ancs_user}" "${POSTGRES_DB:-ancs_db}" > "$BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"
    
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
    echo -e "${GREEN}✓ Size: $(du -h "$BACKUP_FILE" | cut -f1)${NC}"
    
else
    # Direct PostgreSQL backup (for non-Docker deployments)
    BACKUP_FILE="$BACKUP_DIR/ancs_backup_$TIMESTAMP.sql"
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    echo -e "${YELLOW}Creating database backup: $BACKUP_FILE${NC}"
    
    PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${POSTGRES_HOST:-localhost}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-ancs_user}" "${POSTGRES_DB:-ancs_db}" > "$BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"
    
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
    echo -e "${GREEN}✓ Size: $(du -h "$BACKUP_FILE" | cut -f1)${NC}"
fi

# Clean up old backups (keep only last N days)
echo -e "${YELLOW}Cleaning up old backups (keeping last $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "ancs_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
REMAINING=$(ls -1 "$BACKUP_DIR"/ancs_backup_*.sql.gz 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Cleanup complete. $REMAINING backup(s) remaining.${NC}"

# List all backups
echo ""
echo -e "${YELLOW}Available backups:${NC}"
ls -lh "$BACKUP_DIR"/ancs_backup_*.sql.gz 2>/dev/null | awk '{print $9, "(" $5 ")"}'

echo ""
echo -e "${GREEN}Backup complete!${NC}"
echo ""
echo "To restore this backup:"
echo "  1. Extract: gunzip $BACKUP_FILE"
echo "  2. Restore: docker compose -f $COMPOSE_FILE exec -T db psql -U \$POSTGRES_USER \$POSTGRES_DB < ${BACKUP_FILE%.gz}"
