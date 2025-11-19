#!/bin/bash

# PropertyHub Database Setup Script
# This script resets the database and applies migrations with comprehensive seed data

echo "=========================================="
echo "PropertyHub Database Setup"
echo "=========================================="

# Configuration
PROJECT_DIR="PropertyHub.API"
MIGRATION_NAME="ComprehensiveSeedData"

# Navigate to API project directory
cd $PROJECT_DIR

echo ""
echo "Step 1: Dropping existing database..."
dotnet ef database drop --force

echo ""
echo "Step 2: Removing old migrations..."
rm -rf ../PropertyHub.Infrastructure/Migrations/*.cs

echo ""
echo "Step 3: Creating new migration with comprehensive seed data..."
dotnet ef migrations add $MIGRATION_NAME

echo ""
echo "Step 4: Applying migration to database..."
dotnet ef database update

echo ""
echo "=========================================="
echo "Database Setup Complete!"
echo "=========================================="
echo ""
echo "Database Contents:"
echo "  - 7 Countries with currency rates"
echo "  - 7 Regions across multiple countries"
echo "  - 8 Properties (Dubai, New York, London)"
echo "  - 4 Customers with profiles"
echo "  - 5 Leads with AI scores"
echo "  - 2 Reservations"
echo "  - 3 Bookings"
echo "  - 2 Messages"
echo "  - 3 Property Recommendations"
echo ""
echo "Demo Credentials:"
echo "  Admin: admin@propertyhub.com / Admin@123"
echo "  Customer: demo@propertyhub.com (no password needed)"
echo ""
echo "API URL: http://localhost:53951"
echo "Swagger: http://localhost:53951/api-docs"
echo ""
