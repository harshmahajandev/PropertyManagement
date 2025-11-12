# Quick Start Guide - PropertyHub Global

This guide will get you up and running with PropertyHub Global in under 15 minutes.

## Prerequisites Check

Before starting, ensure you have:

- [ ] .NET 8.0 SDK installed ([Download](https://dotnet.microsoft.com/download/dotnet/8.0))
- [ ] PostgreSQL 14+ installed and running
- [ ] Visual Studio 2022 or VS Code
- [ ] Git (for version control)

## Step 1: Verify Prerequisites (2 minutes)

### Check .NET SDK

```bash
dotnet --version
# Should show: 8.0.x or higher
```

### Check PostgreSQL

```bash
psql --version
# Should show: psql (PostgreSQL) 14.x or higher

# Test connection
psql -U postgres -c "SELECT version();"
```

## Step 2: Setup Database (5 minutes)

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE PropertyHubDb;
CREATE USER propertyhub_user WITH ENCRYPTED PASSWORD 'DevPassword123!';
GRANT ALL PRIVILEGES ON DATABASE PropertyHubDb TO propertyhub_user;

# Exit psql
\q
```

### Update Connection String

Edit `PropertyHub.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=PropertyHubDb;Username=propertyhub_user;Password=DevPassword123!"
  }
}
```

## Step 3: Build and Run API (5 minutes)

```bash
# Navigate to API project
cd PropertyHub/PropertyHub.API

# Restore packages
dotnet restore

# Apply database migrations
dotnet ef database update

# Run the API
dotnet run
```

**API will start at:** `https://localhost:7001`

**Swagger Documentation:** `https://localhost:7001/api-docs`

Leave this terminal running!

## Step 4: Run Blazor App (2 minutes)

Open a **new terminal**:

```bash
# Navigate to Blazor project
cd PropertyHub/PropertyHub.BlazorApp

# Restore packages
dotnet restore

# Run the application
dotnet run
```

**Application will start at:** `https://localhost:5001`

## Step 5: Login and Explore (1 minute)

Open your browser and navigate to: `https://localhost:5001`

### Default Credentials

- **Email:** admin@propertyhub.com
- **Password:** Admin@123456

⚠️ **Important:** Change this password immediately in production!

## What You Can Do Now

### 1. Explore the Dashboard

- View KPI metrics
- Navigate to different modules
- Check recent activity

### 2. Test API with Swagger

Navigate to: `https://localhost:7001/api-docs`

Try these endpoints:
- `POST /api/PropertyManagement/get-properties` - List properties
- `POST /api/CRM/get-leads` - View leads
- `POST /api/Reservation/get-reservations` - Check reservations

### 3. Database Exploration

```bash
# Connect to database
psql -U propertyhub_user -d PropertyHubDb

# List all tables
\dt

# View seeded data
SELECT * FROM countries;
SELECT * FROM regions;
SELECT * FROM currency_rates;

# Check Identity users
SELECT "Email", "UserName" FROM "AspNetUsers";
```

## Common Issues and Solutions

### Issue: "dotnet: command not found"

**Solution:** Install .NET 8.0 SDK from https://dotnet.microsoft.com/download

### Issue: "Cannot connect to PostgreSQL"

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
# or check Services on Windows

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
# or start from Services on Windows
```

### Issue: "Migration failed"

**Solution:**
```bash
# Drop and recreate database
dotnet ef database drop --force
dotnet ef database update
```

### Issue: Port already in use

**Solution:** Change ports in `launchSettings.json`:

```json
{
  "https": {
    "applicationUrl": "https://localhost:7002;http://localhost:7003"
  }
}
```

### Issue: Swagger not loading

**Solution:** Ensure you're in Development mode:

```bash
# Set environment variable
export ASPNETCORE_ENVIRONMENT=Development  # Linux/Mac
set ASPNETCORE_ENVIRONMENT=Development     # Windows CMD
$env:ASPNETCORE_ENVIRONMENT="Development"  # Windows PowerShell
```

## Next Steps

### 1. Add Sample Data

Use Swagger or create seed data:

```csharp
// In ApplicationDbContext.OnModelCreating()
modelBuilder.Entity<Property>().HasData(
    new Property {
        Id = Guid.NewGuid(),
        Title = "Luxury Villa",
        Project = "Marina Bay",
        Type = PropertyType.Villa,
        Status = PropertyStatus.Available,
        Price = 2500000,
        Currency = Currency.USD,
        Size = 450,
        Bedrooms = 5,
        Bathrooms = 6,
        Location = "Dubai Marina",
        Description = "Stunning waterfront villa with modern amenities"
    }
);
```

### 2. Explore the Code

**Key Files to Review:**
- `PropertyHub.Core/Entities/Entities.cs` - All 35+ data models
- `PropertyHub.Application/Services/BusinessServices.cs` - All 40+ formulas
- `PropertyHub.API/Controllers/` - API endpoints
- `PropertyHub.Infrastructure/Data/ApplicationDbContext.cs` - Database configuration

### 3. Customize Configuration

Edit `appsettings.json`:

```json
{
  "PropertyHub": {
    "ApplicationName": "Your Company Name",
    "SupportedCurrencies": ["USD", "EUR", "GBP"],
    "SupportedCountries": ["US", "UK", "AE"]
  },
  "Reservation": {
    "DefaultHoldDurationDays": 7,
    "DefaultDepositPercentage": 10
  }
}
```

### 4. Add More Features

Follow patterns in existing controllers:

**Add New API Endpoint:**
```csharp
[HttpPost("your-endpoint")]
public async Task<IActionResult> YourMethod([FromBody] YourRequest request)
{
    var result = await _yourService.DoSomething(request);
    return Ok(result);
}
```

**Add New Blazor Page:**
```razor
@page "/your-page"
@inject ApiService ApiService

<PageTitle>Your Page</PageTitle>

<MudText Typo="Typo.h3">Your Content</MudText>

@code {
    protected override async Task OnInitializedAsync()
    {
        // Load data
    }
}
```

## Development Workflow

### Making Changes

```bash
# 1. Make code changes
# 2. If models changed, create migration
dotnet ef migrations add YourMigrationName

# 3. Update database
dotnet ef database update

# 4. Rebuild
dotnet build

# 5. Run tests
dotnet test

# 6. Run application
dotnet run
```

### Hot Reload

The application supports hot reload:
- Make changes to .cs or .razor files
- Save the file
- Changes apply automatically (most cases)

## VS Code Setup

### Install Extensions

1. C# for Visual Studio Code
2. C# Dev Kit
3. .NET Core Test Explorer
4. PostgreSQL

### Configure Launch

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch API",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/PropertyHub.API/bin/Debug/net8.0/PropertyHub.API.dll",
      "cwd": "${workspaceFolder}/PropertyHub.API",
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    {
      "name": "Launch Blazor",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/PropertyHub.BlazorApp/bin/Debug/net8.0/PropertyHub.BlazorApp.dll",
      "cwd": "${workspaceFolder}/PropertyHub.BlazorApp",
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  ],
  "compounds": [
    {
      "name": "Full Stack",
      "configurations": ["Launch API", "Launch Blazor"]
    }
  ]
}
```

## Visual Studio Setup

### Open Solution

1. Open Visual Studio 2022
2. File → Open → Project/Solution
3. Select `PropertyHub.sln`
4. Wait for restore to complete

### Set Multiple Startup Projects

1. Right-click solution → Properties
2. Select "Multiple startup projects"
3. Set `PropertyHub.API` to "Start"
4. Set `PropertyHub.BlazorApp` to "Start"
5. Click OK

### Run Application

Press **F5** or click **Start**

Both API and Blazor will launch simultaneously!

## Learning Resources

### Understand the Architecture

1. **README.md** - Complete feature list and overview
2. **PROJECT_SUMMARY.md** - Implementation status and roadmap
3. **DEPLOYMENT_GUIDE.md** - Production deployment
4. **DATABASE_SETUP.md** - Database management

### Code Examples

- **PropertyManagementController.cs** - Complete CRUD operations
- **CRMController.cs** - Lead scoring and management
- **ReservationController.cs** - Booking workflow
- **BusinessServices.cs** - All 40+ calculation formulas

### API Documentation

- Swagger UI: `https://localhost:7001/api-docs`
- Interactive testing
- Request/response schemas
- Authentication testing

## Testing Your Setup

### 1. Test API Health

```bash
curl https://localhost:7001/api/PropertyManagement/get-properties \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"limit": 10, "offset": 0}' \
  -k
```

### 2. Test Database

```bash
psql -U propertyhub_user -d PropertyHubDb -c "SELECT COUNT(*) FROM properties;"
```

### 3. Test Blazor Rendering

Open browser to `https://localhost:5001` and check:
- [ ] Dashboard loads
- [ ] KPI cards display
- [ ] Quick actions work
- [ ] Recent activity shows

## Getting Help

### Documentation
- [README.md](../README.md)
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [DATABASE_SETUP.md](DATABASE_SETUP.md)

### Debug Mode
Enable detailed logging in `appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft": "Debug"
    }
  }
}
```

### Check Logs
- **API Logs**: `PropertyHub.API/logs/`
- **Console Output**: Terminal where you ran `dotnet run`

## Success Checklist

- [ ] .NET 8.0 SDK installed and verified
- [ ] PostgreSQL running and accessible
- [ ] Database created and migrations applied
- [ ] API running on https://localhost:7001
- [ ] Swagger documentation accessible
- [ ] Blazor app running on https://localhost:5001
- [ ] Logged in with default admin credentials
- [ ] Dashboard displaying correctly

## You're Ready!

🎉 **Congratulations!** PropertyHub Global is now running locally.

You can now:
- ✅ Explore the existing features
- ✅ Add new properties via Swagger
- ✅ Create leads and test scoring
- ✅ Make reservations
- ✅ Customize the application
- ✅ Deploy to production

Happy coding! 🚀

---

**PropertyHub Global** - Quick Start Guide © 2025
