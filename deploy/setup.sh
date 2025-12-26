#!/bin/bash

# Quick Setup Script for ANCS
# This script helps with initial setup

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "==================================="
echo "  ANCS Quick Setup"
echo "==================================="
echo ""

# Create .env from example if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo "  Please edit .env and add your configuration"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Create frontend/.env from example if not exists
if [ ! -f frontend/.env ]; then
    echo -e "${YELLOW}Creating frontend/.env file...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ frontend/.env file created${NC}"
    echo "  Please edit frontend/.env and add your configuration"
else
    echo -e "${GREEN}✓ frontend/.env file already exists${NC}"
fi

# Generate Django secret key if needed
if grep -q "change-me" .env 2>/dev/null; then
    echo -e "${YELLOW}Generating Django secret key...${NC}"
    SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
    sed -i.bak "s/DJANGO_SECRET_KEY=change-me/DJANGO_SECRET_KEY=$SECRET_KEY/" .env
    rm .env.bak 2>/dev/null || true
    echo -e "${GREEN}✓ Django secret key generated${NC}"
fi

echo ""
echo "==================================="
echo "  Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Edit .env and frontend/.env with your configuration"
echo "2. Run deployment:"
echo "   - Development: ./deploy/deploy.sh dev"
echo "   - Production: ./deploy/deploy.sh prod"
echo ""
echo "For more information, see DEPLOYMENT.md"
