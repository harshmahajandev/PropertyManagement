# PropertyHub Database Setup Script
# This script resets the database and applies migrations with comprehensive seed data

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PropertyHub Database Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Configuration
$ProjectDir = "PropertyHub.API"
$MigrationName = "ComprehensiveSeedData"

# Navigate to API project directory
Set-Location $ProjectDir

Write-Host ""
Write-Host "Step 1: Dropping existing database..." -ForegroundColor Yellow
dotnet ef database drop --force

Write-Host ""
Write-Host "Step 2: Removing old migrations..." -ForegroundColor Yellow
Remove-Item "../PropertyHub.Infrastructure/Migrations/*.cs" -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Step 3: Creating new migration with comprehensive seed data..." -ForegroundColor Yellow
dotnet ef migrations add $MigrationName

Write-Host ""
Write-Host "Step 4: Applying migration to database..." -ForegroundColor Yellow
dotnet ef database update

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Database Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Database Contents:" -ForegroundColor White
Write-Host "  - 7 Countries with currency rates" -ForegroundColor Gray
Write-Host "  - 7 Regions across multiple countries" -ForegroundColor Gray
Write-Host "  - 8 Properties (Dubai, New York, London)" -ForegroundColor Gray
Write-Host "  - 4 Customers with profiles" -ForegroundColor Gray
Write-Host "  - 5 Leads with AI scores" -ForegroundColor Gray
Write-Host "  - 2 Reservations" -ForegroundColor Gray
Write-Host "  - 3 Bookings" -ForegroundColor Gray
Write-Host "  - 2 Messages" -ForegroundColor Gray
Write-Host "  - 3 Property Recommendations" -ForegroundColor Gray
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor White
Write-Host "  Admin: admin@propertyhub.com / Admin@123" -ForegroundColor Gray
Write-Host "  Customer: demo@propertyhub.com (no password needed)" -ForegroundColor Gray
Write-Host ""
Write-Host "API URL: http://localhost:53951" -ForegroundColor Cyan
Write-Host "Swagger: http://localhost:53951/api-docs" -ForegroundColor Cyan
Write-Host ""
