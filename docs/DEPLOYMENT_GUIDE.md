# PropertyHub Global - Deployment Guide

This guide provides step-by-step instructions for deploying PropertyHub Global to both Azure App Service and IIS (Windows Server).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Azure App Service Deployment](#azure-app-service-deployment)
4. [IIS Deployment](#iis-deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### General Requirements
- .NET 8.0 Runtime
- PostgreSQL 14+ database
- SSL certificate for HTTPS
- OpenAI API key for GPT-4.1 (for AI features)

### Azure Deployment Requirements
- Azure subscription
- Azure CLI installed
- Azure Account with appropriate permissions

### IIS Deployment Requirements
- Windows Server 2016 or later
- IIS 10.0 or later
- .NET 8.0 Hosting Bundle
- URL Rewrite Module for IIS

## Database Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE PropertyHubDb;
CREATE USER propertyhub_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE PropertyHubDb TO propertyhub_user;
```

### 2. Update Connection String

Create `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-server;Database=PropertyHubDb;Username=propertyhub_user;Password=your_secure_password;SSL Mode=Require"
  },
  "JWT": {
    "SecretKey": "YourVeryLongAndSecureSecretKeyForProduction!@#$%^&*()",
    "Issuer": "PropertyHubGlobal",
    "Audience": "PropertyHubClients",
    "ExpirationInMinutes": 720
  },
  "OpenAI": {
    "ApiKey": "your-openai-api-key-here",
    "Model": "gpt-4.1",
    "MaxTokens": 1000
  }
}
```

### 3. Apply Migrations

```bash
cd PropertyHub.API
dotnet ef database update --connection "Host=your-server;Database=PropertyHubDb;Username=propertyhub_user;Password=your_password"
```

## Azure App Service Deployment

### Option 1: Using Azure CLI

#### Step 1: Login to Azure

```bash
az login
```

#### Step 2: Create Resource Group

```bash
az group create --name PropertyHubRG --location "East US"
```

#### Step 3: Create App Service Plan

```bash
az appservice plan create \
  --name PropertyHubPlan \
  --resource-group PropertyHubRG \
  --sku B2 \
  --is-linux
```

#### Step 4: Create Web Apps

**API App:**
```bash
az webapp create \
  --resource-group PropertyHubRG \
  --plan PropertyHubPlan \
  --name propertyhub-api \
  --runtime "DOTNETCORE:8.0"
```

**Blazor App:**
```bash
az webapp create \
  --resource-group PropertyHubRG \
  --plan PropertyHubPlan \
  --name propertyhub-web \
  --runtime "DOTNETCORE:8.0"
```

#### Step 5: Configure Database Connection

```bash
az webapp config connection-string set \
  --resource-group PropertyHubRG \
  --name propertyhub-api \
  --settings DefaultConnection="Host=your-postgres-server;Database=PropertyHubDb;Username=user;Password=pwd" \
  --connection-string-type PostgreSQL
```

#### Step 6: Build and Publish

**API:**
```bash
cd PropertyHub.API
dotnet publish -c Release -o ./publish
cd publish
zip -r ../api.zip *
az webapp deployment source config-zip \
  --resource-group PropertyHubRG \
  --name propertyhub-api \
  --src ../api.zip
```

**Blazor App:**
```bash
cd PropertyHub.BlazorApp
dotnet publish -c Release -o ./publish
cd publish
zip -r ../blazor.zip *
az webapp deployment source config-zip \
  --resource-group PropertyHubRG \
  --name propertyhub-web \
  --src ../blazor.zip
```

#### Step 7: Configure Application Settings

```bash
az webapp config appsettings set \
  --resource-group PropertyHubRG \
  --name propertyhub-api \
  --settings ASPNETCORE_ENVIRONMENT=Production \
             JWT__SecretKey="your-secret-key" \
             OpenAI__ApiKey="your-openai-key"
```

#### Step 8: Enable HTTPS

```bash
az webapp update \
  --resource-group PropertyHubRG \
  --name propertyhub-api \
  --https-only true

az webapp update \
  --resource-group PropertyHubRG \
  --name propertyhub-web \
  --https-only true
```

### Option 2: Using Azure Portal

#### Step 1: Create Azure PostgreSQL Database

1. Navigate to Azure Portal
2. Create new "Azure Database for PostgreSQL - Flexible Server"
3. Configure:
   - Server name: `propertyhub-db`
   - Admin username: `propertyhub_admin`
   - Password: (secure password)
   - Region: Same as App Service
   - Compute + storage: Configure as needed

#### Step 2: Create App Services

1. Navigate to "App Services"
2. Click "Create" → "Web App"
3. Configure API App:
   - Name: `propertyhub-api`
   - Runtime: .NET 8 (LTS)
   - Region: Choose your region
   - Pricing: B2 or higher recommended
4. Repeat for Blazor App: `propertyhub-web`

#### Step 3: Configure Connection Strings

1. Open API App Service
2. Go to "Configuration" → "Connection strings"
3. Add:
   - Name: `DefaultConnection`
   - Value: `Host=propertyhub-db.postgres.database.azure.com;Database=PropertyHubDb;Username=propertyhub_admin;Password=your_password;SSL Mode=Require`
   - Type: PostgreSQL

#### Step 4: Configure Application Settings

Add the following settings:
- `ASPNETCORE_ENVIRONMENT`: `Production`
- `JWT__SecretKey`: (your secret key)
- `OpenAI__ApiKey`: (your OpenAI key)
- `ApiSettings__BaseUrl`: `https://propertyhub-api.azurewebsites.net/api/`

#### Step 5: Deploy from Visual Studio

1. Right-click on `PropertyHub.API` project
2. Select "Publish"
3. Choose "Azure" → "Azure App Service (Windows)"
4. Select `propertyhub-api`
5. Click "Publish"
6. Repeat for `PropertyHub.BlazorApp` → `propertyhub-web`

## IIS Deployment

### Step 1: Install Prerequisites

#### Install .NET 8.0 Hosting Bundle

1. Download from: https://dotnet.microsoft.com/download/dotnet/8.0
2. Run installer: `dotnet-hosting-8.0.x-win.exe`
3. Restart IIS: `iisreset`

#### Install URL Rewrite Module

1. Download from: https://www.iis.net/downloads/microsoft/url-rewrite
2. Install `rewrite_amd64_en-US.msi`

### Step 2: Prepare Application

#### Build for Production

```bash
# API
cd PropertyHub.API
dotnet publish -c Release -o C:\inetpub\PropertyHubAPI

# Blazor App
cd PropertyHub.BlazorApp
dotnet publish -c Release -o C:\inetpub\PropertyHubWeb
```

### Step 3: Configure IIS

#### Create Application Pool

1. Open IIS Manager
2. Right-click "Application Pools" → "Add Application Pool"
3. Name: `PropertyHubAPI`
4. .NET CLR Version: "No Managed Code"
5. Managed Pipeline Mode: "Integrated"
6. Click "OK"
7. Repeat for `PropertyHubWeb`

#### Configure Application Pool Settings

1. Select `PropertyHubAPI` pool
2. Right-click → "Advanced Settings"
3. Set:
   - Identity: ApplicationPoolIdentity
   - Enable 32-Bit Applications: False
   - Start Mode: AlwaysRunning
   - Idle Time-out: 0 (for always running)

#### Create Websites

**API Site:**
1. Right-click "Sites" → "Add Website"
2. Site name: `PropertyHub API`
3. Application pool: `PropertyHubAPI`
4. Physical path: `C:\inetpub\PropertyHubAPI`
5. Binding:
   - Type: https
   - Port: 443
   - Host name: `api.propertyhub.com`
   - SSL certificate: (select certificate)

**Blazor Site:**
1. Right-click "Sites" → "Add Website"
2. Site name: `PropertyHub Web`
3. Application pool: `PropertyHubWeb`
4. Physical path: `C:\inetpub\PropertyHubWeb`
5. Binding:
   - Type: https
   - Port: 443
   - Host name: `www.propertyhub.com`
   - SSL certificate: (select certificate)

### Step 4: Configure web.config

#### API web.config

Create `C:\inetpub\PropertyHubAPI\web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
    </handlers>
    <aspNetCore processPath="dotnet" 
                arguments=".\PropertyHub.API.dll" 
                stdoutLogEnabled="true" 
                stdoutLogFile=".\logs\stdout" 
                hostingModel="inprocess">
      <environmentVariables>
        <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
      </environmentVariables>
    </aspNetCore>
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="104857600" />
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

### Step 5: Set Permissions

```powershell
# Grant IIS_IUSRS permissions
icacls "C:\inetpub\PropertyHubAPI" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\PropertyHubWeb" /grant "IIS_IUSRS:(OI)(CI)F" /T

# Grant ApplicationPoolIdentity permissions
icacls "C:\inetpub\PropertyHubAPI" /grant "IIS APPPOOL\PropertyHubAPI:(OI)(CI)F" /T
icacls "C:\inetpub\PropertyHubWeb" /grant "IIS APPPOOL\PropertyHubWeb:(OI)(CI)F" /T
```

### Step 6: Configure PostgreSQL Connection

Update `appsettings.Production.json` in both deployed directories with your PostgreSQL connection string.

### Step 7: Restart IIS

```powershell
iisreset
```

## Post-Deployment Configuration

### 1. Verify Database Migrations

```bash
# SSH into server or use remote PowerShell
cd /path/to/PropertyHub.API
dotnet ef database update
```

### 2. Create Admin User

The application automatically creates an admin user on first run:
- Email: admin@propertyhub.com
- Password: Admin@123456

**Important**: Change this password immediately after first login!

### 3. Configure CORS

If API and Blazor are on different domains, update CORS in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowBlazor", policy =>
    {
        policy.WithOrigins("https://www.propertyhub.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Use the policy
app.UseCors("AllowBlazor");
```

### 4. Configure SSL/TLS

#### For Azure:
- Azure automatically provides SSL with *.azurewebsites.net
- For custom domains, upload certificate in Azure Portal → App Service → TLS/SSL settings

#### For IIS:
1. Obtain SSL certificate (Let's Encrypt, commercial CA, etc.)
2. Import certificate to Windows Certificate Store
3. Bind certificate to IIS site

### 5. Setup Monitoring

#### Azure Application Insights

```bash
# Add Application Insights NuGet package
dotnet add package Microsoft.ApplicationInsights.AspNetCore

# Configure in Program.cs
builder.Services.AddApplicationInsightsTelemetry();
```

#### IIS Logging

Enable detailed error logging in `web.config`:

```xml
<aspNetCore stdoutLogEnabled="true" stdoutLogFile=".\logs\stdout" />
```

### 6. Configure Backup

#### Azure:
- Enable automated backups in App Service
- Configure PostgreSQL backup retention

#### IIS:
- Schedule regular backups of `C:\inetpub\PropertyHubAPI` and `C:\inetpub\PropertyHubWeb`
- Implement PostgreSQL backup strategy (pg_dump)

## Troubleshooting

### Common Issues

#### 500 Internal Server Error

1. Check application logs:
   - Azure: App Service → Monitoring → Log stream
   - IIS: `C:\inetpub\PropertyHubAPI\logs`

2. Enable detailed errors in `appsettings.json`:
   ```json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Debug",
         "Microsoft.AspNetCore": "Debug"
       }
     }
   }
   ```

#### Database Connection Failed

1. Verify connection string
2. Check firewall rules (Azure PostgreSQL)
3. Test connection with psql or pgAdmin

```bash
psql -h your-server.postgres.database.azure.com -U propertyhub_admin -d PropertyHubDb
```

#### Blazor App Can't Connect to API

1. Verify API URL in Blazor appsettings
2. Check CORS configuration
3. Verify SSL certificates are valid

#### IIS Application Pool Crashes

1. Check Event Viewer → Application logs
2. Verify .NET 8.0 Hosting Bundle is installed
3. Check ApplicationPoolIdentity permissions

### Performance Optimization

#### Enable Response Compression

```csharp
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});
```

#### Enable Output Caching

```csharp
builder.Services.AddOutputCache();
app.UseOutputCache();
```

#### Configure Connection Pool

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=server;Database=db;Username=user;Password=pwd;Pooling=true;MinPoolSize=5;MaxPoolSize=100"
  }
}
```

## Security Checklist

- [ ] Change default admin password
- [ ] Configure strong JWT secret key
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable request rate limiting
- [ ] Configure proper user roles and permissions
- [ ] Implement security headers
- [ ] Enable SQL injection protection (EF Core handles this)
- [ ] Regular security updates

## Scaling Considerations

### Azure Scaling

1. **Scale Up**: Increase App Service Plan tier
2. **Scale Out**: Enable auto-scaling based on metrics
3. **Database**: Upgrade PostgreSQL tier
4. **CDN**: Use Azure CDN for static assets

### IIS Scaling

1. **Load Balancing**: Set up Application Request Routing (ARR)
2. **Multiple Servers**: Deploy to server farm
3. **Database**: Configure PostgreSQL replication
4. **Caching**: Implement Redis cache

## Support

For deployment issues:
- Check logs in respective environments
- Review troubleshooting section
- Contact: devops@propertyhub.com

---

**PropertyHub Global** - Deployment Guide © 2025
