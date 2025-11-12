# Database Setup Guide

## Overview

PropertyHub Global uses PostgreSQL as its primary database with Entity Framework Core for data access. This guide covers database installation, configuration, migrations, and maintenance.

## Table of Contents

1. [PostgreSQL Installation](#postgresql-installation)
2. [Database Configuration](#database-configuration)
3. [Entity Framework Migrations](#entity-framework-migrations)
4. [Seeding Initial Data](#seeding-initial-data)
5. [Backup and Restore](#backup-and-restore)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)

## PostgreSQL Installation

### Windows

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (postgresql-14.x-windows-x64.exe)
3. Follow the installation wizard:
   - Choose installation directory
   - Select components (PostgreSQL Server, pgAdmin 4, Command Line Tools)
   - Set data directory
   - **Set superuser password** (remember this!)
   - Port: 5432 (default)
4. Complete installation

### Linux (Ubuntu/Debian)

```bash
# Update package lists
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### macOS

```bash
# Using Homebrew
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Verify installation
psql --version
```

### Azure PostgreSQL

```bash
# Create using Azure CLI
az postgres flexible-server create \
  --resource-group PropertyHubRG \
  --name propertyhub-db \
  --location eastus \
  --admin-user propertyhub_admin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B2s \
  --version 14 \
  --storage-size 32

# Configure firewall (allow Azure services)
az postgres flexible-server firewall-rule create \
  --resource-group PropertyHubRG \
  --name propertyhub-db \
  --rule-name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Database Configuration

### 1. Create Database and User

Connect to PostgreSQL:

```bash
# Windows
psql -U postgres

# Linux
sudo -u postgres psql

# Azure
psql "host=propertyhub-db.postgres.database.azure.com port=5432 dbname=postgres user=propertyhub_admin sslmode=require"
```

Create database and user:

```sql
-- Create database
CREATE DATABASE PropertyHubDb
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Create user
CREATE USER propertyhub_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE PropertyHubDb TO propertyhub_user;

-- Connect to the database
\c PropertyHubDb

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO propertyhub_user;

-- Verify
\l
```

### 2. Configure Connection String

Update `appsettings.json`:

**Local Development:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=PropertyHubDb;Username=propertyhub_user;Password=your_password"
  }
}
```

**Production (with SSL):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=propertyhub-db.postgres.database.azure.com;Port=5432;Database=PropertyHubDb;Username=propertyhub_admin;Password=your_password;SSL Mode=Require;Trust Server Certificate=true"
  }
}
```

## Entity Framework Migrations

### Install EF Core Tools

```bash
# Global installation
dotnet tool install --global dotnet-ef

# Or update existing
dotnet tool update --global dotnet-ef

# Verify installation
dotnet ef --version
```

### Create Initial Migration

```bash
cd PropertyHub.API

# Create migration
dotnet ef migrations add InitialCreate --project ../PropertyHub.Infrastructure --startup-project .

# Review generated migration files in PropertyHub.Infrastructure/Migrations/
```

### Apply Migrations

```bash
# Update database to latest migration
dotnet ef database update --project ../PropertyHub.Infrastructure --startup-project .

# Update to specific migration
dotnet ef database update MigrationName --project ../PropertyHub.Infrastructure --startup-project .

# With custom connection string
dotnet ef database update --connection "Host=localhost;Database=PropertyHubDb;Username=user;Password=pwd"
```

### View Migration Status

```bash
# List all migrations and their status
dotnet ef migrations list --project ../PropertyHub.Infrastructure --startup-project .

# View SQL that will be executed
dotnet ef migrations script --project ../PropertyHub.Infrastructure --startup-project .

# Generate SQL script for specific range
dotnet ef migrations script FromMigration ToMigration --project ../PropertyHub.Infrastructure --startup-project . --output migration.sql
```

### Remove Last Migration

```bash
# Remove the last unapplied migration
dotnet ef migrations remove --project ../PropertyHub.Infrastructure --startup-project .

# Force remove (if already applied, first rollback)
dotnet ef database update PreviousMigrationName
dotnet ef migrations remove --project ../PropertyHub.Infrastructure --startup-project .
```

## Database Schema

### Tables Overview

#### Core Tables (4)
- **regions** - Geographic regions
- **countries** - Supported countries  
- **currency_rates** - Exchange rates
- **aspnetusers** - Identity users

#### Property Management (3)
- **properties** - Main property catalog
- **global_properties** - Global portfolio
- **projects** - Development projects

#### CRM & Leads (3)
- **leads** - Sales leads
- **global_leads** - Global lead management
- **customers** - Converted customers

#### Customer Portal (5)
- **customer_preferences** - Customer property preferences
- **customer_portal_preferences** - Portal preferences
- **property_recommendations** - AI recommendations
- **customer_portal_recommendations** - Portal recommendations
- **messages** - Internal messaging

#### Reservations & Bookings (6)
- **reservations** - Property reservations
- **global_reservations** - Global reservations
- **bookings** - Customer bookings
- **customer_portal_bookings** - Portal bookings
- **booking_preferences** - Booking preferences
- **reservation_timelines** - Reservation events

#### Analytics (5)
- **global_analytics** - Analytics metrics
- **financial_records** - Financial transactions
- **market_intelligence** - Market data
- **investment_portfolios** - Investment tracking
- **esg_metrics** - ESG performance

#### Snagging (2)
- **snagging_issues** - Issue tracking
- **contractors** - Contractor management

#### Communication (2)
- **global_notifications** - System notifications
- **quick_inquiries** - Property inquiries

## Seeding Initial Data

### Automatic Seeding

The application automatically seeds:
- **Countries**: US, UK, UAE, Canada, Australia, Singapore, Japan
- **Regions**: Dubai Marina, Downtown Dubai, Jumeirah, Manhattan, London City
- **Currency Rates**: USD to EUR, GBP, AED, CAD, AUD, SGD, JPY
- **Roles**: Admin, Manager, SalesAgent, etc.
- **Default Admin**: admin@propertyhub.com / Admin@123456

Seeding occurs automatically on application startup via `Program.cs`.

### Manual Seeding

Create custom seed data:

```sql
-- Insert sample properties
INSERT INTO properties (id, title, project, type, status, price, currency, size, bedrooms, bathrooms, location, description, created_at)
VALUES 
(gen_random_uuid(), 'Luxury Villa', 'Marina Bay', 0, 0, 2500000, 0, 450, 5, 6, 'Dubai Marina', 'Stunning waterfront villa', NOW()),
(gen_random_uuid(), 'Modern Apartment', 'Sky Tower', 1, 0, 850000, 0, 120, 2, 2, 'Downtown Dubai', 'Contemporary living space', NOW());

-- Insert sample leads
INSERT INTO leads (id, first_name, last_name, email, phone, buyer_type, budget_max, currency, timeline, status, score, source, created_at)
VALUES
(gen_random_uuid(), 'John', 'Smith', 'john.smith@example.com', '+1234567890', 0, 3000000, 0, 0, 0, 95, 'Website', NOW()),
(gen_random_uuid(), 'Sarah', 'Johnson', 'sarah.j@example.com', '+1987654321', 1, 1500000, 0, 1, 0, 75, 'Referral', NOW());
```

## Backup and Restore

### Backup Database

#### Using pg_dump

```bash
# Backup entire database
pg_dump -h localhost -U propertyhub_user -d PropertyHubDb -F c -b -v -f "propertyhub_backup_$(date +%Y%m%d).backup"

# Backup as SQL script
pg_dump -h localhost -U propertyhub_user -d PropertyHubDb > propertyhub_backup_$(date +%Y%m%d).sql

# Backup specific tables
pg_dump -h localhost -U propertyhub_user -d PropertyHubDb -t properties -t leads > selected_tables.sql

# Azure PostgreSQL backup
pg_dump "host=propertyhub-db.postgres.database.azure.com port=5432 dbname=PropertyHubDb user=propertyhub_admin sslmode=require" -F c -f azure_backup.backup
```

#### Automated Backup Script (Linux/Mac)

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/propertyhub"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/propertyhub_$TIMESTAMP.backup"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U propertyhub_user -d PropertyHubDb -F c -b -v -f "$BACKUP_FILE"

# Keep only last 7 days
find $BACKUP_DIR -name "propertyhub_*.backup" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

Make executable and schedule:

```bash
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /path/to/backup.sh >> /var/log/propertyhub_backup.log 2>&1
```

### Restore Database

```bash
# Restore from custom format backup
pg_restore -h localhost -U propertyhub_user -d PropertyHubDb -v "propertyhub_backup.backup"

# Restore from SQL script
psql -h localhost -U propertyhub_user -d PropertyHubDb < propertyhub_backup.sql

# Drop and recreate database before restore
dropdb -h localhost -U postgres PropertyHubDb
createdb -h localhost -U postgres PropertyHubDb
pg_restore -h localhost -U propertyhub_user -d PropertyHubDb -v "propertyhub_backup.backup"
```

## Performance Optimization

### Indexing Strategy

The application automatically creates indexes on:
- Property: status, type, price, location
- Lead: email, status, score
- Reservation: reservation_number, status, customer_email
- Customer: email (unique), phone
- Snagging: status, priority, category
- Financial Records: transaction_date, transaction_type

### Additional Custom Indexes

```sql
-- Composite index for property search
CREATE INDEX idx_properties_search ON properties(status, type, price);

-- Index for date range queries
CREATE INDEX idx_reservations_dates ON reservations(created_at, hold_end_date);

-- Full-text search index
CREATE INDEX idx_properties_fulltext ON properties USING gin(to_tsvector('english', title || ' ' || description));
```

### Connection Pooling

Configure in connection string:

```
Host=localhost;Database=PropertyHubDb;Username=user;Password=pwd;Pooling=true;MinPoolSize=5;MaxPoolSize=100;ConnectionIdleLifetime=300;
```

### Vacuum and Analyze

```bash
# Manual vacuum
psql -h localhost -U postgres -d PropertyHubDb -c "VACUUM ANALYZE;"

# Configure auto-vacuum (postgresql.conf)
autovacuum = on
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
```

### Query Performance Monitoring

```sql
-- Enable query logging (postgresql.conf)
log_statement = 'all'
log_duration = on
log_min_duration_statement = 1000  -- Log queries > 1 second

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Current connections
SELECT * FROM pg_stat_activity WHERE datname = 'PropertyHubDb';
```

## Troubleshooting

### Connection Issues

#### "Connection refused"

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
# or check Services on Windows

# Check listening port
sudo netstat -plnt | grep 5432

# Verify pg_hba.conf allows connections
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### "Password authentication failed"

```bash
# Reset password
sudo -u postgres psql
ALTER USER propertyhub_user WITH PASSWORD 'new_password';
```

### Migration Errors

#### "A network-related or instance-specific error"

- Check connection string
- Verify PostgreSQL is running
- Check firewall rules

#### "The entity type 'X' requires a primary key"

- Ensure all entities inherit from `BaseEntity` or have `[Key]` attribute

#### "Cannot insert duplicate key"

```bash
# Check for existing data
# May need to drop and recreate database
dotnet ef database drop --force
dotnet ef database update
```

### Performance Issues

#### Slow Queries

```sql
-- View table statistics
SELECT schemaname, tablename, n_live_tup, n_dead_tup, last_vacuum, last_analyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Analyze specific query
EXPLAIN ANALYZE SELECT * FROM properties WHERE status = 0;
```

#### High Memory Usage

```bash
# Check memory settings (postgresql.conf)
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB
```

## Maintenance Tasks

### Weekly Tasks
- Vacuum and analyze database
- Review slow query log
- Check backup completion

### Monthly Tasks
- Review and optimize indexes
- Analyze database size growth
- Test backup restore process
- Update statistics

### Quarterly Tasks
- Security patch updates
- Performance tuning review
- Capacity planning

## Monitoring

### Essential Queries

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('PropertyHubDb'));

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'PropertyHubDb';

-- Locks
SELECT * FROM pg_locks WHERE NOT granted;
```

## Security Best Practices

- [ ] Use strong passwords
- [ ] Limit network access (pg_hba.conf)
- [ ] Enable SSL/TLS connections
- [ ] Regular security updates
- [ ] Principle of least privilege for users
- [ ] Encrypt backups
- [ ] Regular security audits

---

**PropertyHub Global** - Database Setup Guide © 2025
