# PropertyHub Database Reset Script
# This script will drop and recreate the database

Write-Host "PropertyHub Database Reset Tool" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$confirmation = Read-Host "This will DROP the entire PropertyHubDb database. Are you sure? (yes/no)"

if ($confirmation -ne 'yes') {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Dropping and recreating database..." -ForegroundColor Yellow

# Navigate to Infrastructure project
Set-Location PropertyHub.Infrastructure

# Drop the database
Write-Host "Dropping database..." -ForegroundColor Red
dotnet ef database drop --force -s ../PropertyHub.API

# Apply migrations
Write-Host ""
Write-Host "Applying migrations..." -ForegroundColor Green
dotnet ef database update -s ../PropertyHub.API

Write-Host ""
Write-Host "Database reset complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run the API with: cd PropertyHub.API; dotnet run" -ForegroundColor Cyan

# Return to root
Set-Location ..

