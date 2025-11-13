# PropertyHub Application - Testing Guide

## 🎯 Summary of Changes Made

### Backend (API) Changes

#### 1. Authentication/Authorization Disabled
- **Program.cs**: Commented out all authentication and authorization configuration
  - Identity services (lines 31-43)
  - Authorization services (line 119)
  - Authentication middleware (lines 149-150)

#### 2. Controllers - Removed Authorization Attributes
- ✅ **DashboardController**: `[Authorize]` commented out
- ✅ **ReservationController**: `[Authorize]` commented out
- ✅ **CRMController**: Already commented out
- ✅ **PropertyManagementController**: Already commented out
- ✅ **CustomerPortalController**: No `[Authorize]` attribute (open endpoints)

#### 3. CORS Configuration
- Removed conflicting "Development" CORS policy
- Kept "AllowAngular" policy for `http://localhost:4200`

### Frontend (Angular) Changes

#### 1. Authentication Guards Disabled
- **app.routes.ts**: Commented out all `AuthGuard` imports and `canActivate` guards
  - All routes now accessible without authentication

#### 2. HTTP Interceptors Updated
- **app.config.ts**: Commented out `authInterceptor`
  - HTTP requests no longer send authentication tokens

### Database Status
- ✅ PostgreSQL database already exists
- ✅ Migrations already applied
- ✅ Seed data available (Countries, Regions, Currency Rates)
- ✅ Connection string: `Host=localhost;Database=PropertyHubDb;Username=postgres;Password=postgres`

---

## 🚀 How to Test the Application

### Prerequisites
- ✅ PostgreSQL running on localhost (default port 5432)
- ✅ Node.js and Angular CLI installed
- ✅ .NET 8.0 SDK installed

### Step 1: Start the Backend API

```powershell
cd D:\work\PropertyManagement-MinMax\PropertyManagement\PropertyHub.API
dotnet run
```

**Expected Output:**
- API should start on `http://localhost:53951` and `https://localhost:53950`
- Swagger UI available at `http://localhost:53951/api-docs`

**Health Check:**
- Open browser: `http://localhost:53951/api/CustomerPortal/health`
- Should return:
```json
{
  "status": "healthy",
  "module": "CustomerPortal",
  "timestamp": "2025-11-13T...",
  "features": [...]
}
```

### Step 2: Start the Angular Frontend

The Angular app is already running on `http://localhost:4200/`

If you need to restart it:
```powershell
cd D:\work\PropertyManagement-MinMax\PropertyManagement\PropertyHub.Angular
ng serve
```

### Step 3: Test the Application

#### Option A: Test Customer Portal Flow

1. **Navigate to Dashboard** (http://localhost:4200/dashboard)
   - Should load without authentication
   - May show empty data initially

2. **Test Customer Registration** (if available in UI)
   - POST `http://localhost:53951/api/CustomerPortal/register`
   - Example body:
   ```json
   {
     "email": "test@example.com",
     "fullName": "Test User",
     "phone": "+1234567890",
     "country": "US",
     "preferredCurrency": "USD"
   }
   ```

3. **Get Customer Dashboard**
   - GET `http://localhost:53951/api/CustomerPortal/dashboard/{customerId}`
   - Replace `{customerId}` with actual GUID

#### Option B: Test via Swagger UI

1. Open `http://localhost:53951/api-docs`
2. Expand any endpoint (e.g., CustomerPortal)
3. Click "Try it out"
4. Execute requests without authentication

#### Available API Endpoints:

**Customer Portal:**
- POST `/api/CustomerPortal/register` - Register new customer
- POST `/api/CustomerPortal/login` - Customer login
- GET `/api/CustomerPortal/dashboard/{customerId}` - Get dashboard
- GET `/api/CustomerPortal/profile/{customerId}` - Get profile
- GET `/api/CustomerPortal/recommendations/{customerId}` - Get recommendations
- GET `/api/CustomerPortal/bookings/{customerId}` - Get bookings
- GET `/api/CustomerPortal/messages/{customerId}` - Get messages
- GET `/api/CustomerPortal/health` - Health check

**Dashboard:**
- GET `/api/Dashboard/summary` - Dashboard summary
- GET `/api/Dashboard/properties/stats` - Property statistics
- GET `/api/Dashboard/leads/stats` - Lead statistics
- GET `/api/Dashboard/reservations/stats` - Reservation statistics
- GET `/api/Dashboard/financial/stats` - Financial statistics

**Properties:**
- Available via PropertyManagement controller at `/api/properties`

**CRM:**
- Available via CRM controller at `/api/crm`

**Reservations:**
- Available via Reservation controller at `/api/Reservation`

---

## 🧪 Quick Test Commands (PowerShell)

### Test Customer Portal Health
```powershell
curl http://localhost:53951/api/CustomerPortal/health
```

### Test Dashboard Summary
```powershell
curl http://localhost:53951/api/Dashboard/summary
```

### Register a Test Customer
```powershell
$body = @{
    email = "test@example.com"
    fullName = "Test User"
    phone = "+1234567890"
    country = "US"
    preferredCurrency = "USD"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:53951/api/CustomerPortal/register" -Method Post -Body $body -ContentType "application/json"
```

---

## 🐛 Troubleshooting

### API Won't Start
- Check if PostgreSQL is running
- Verify database connection string in `appsettings.json`
- Check if port 53951 is available

### Angular Compilation Warnings
- The optional chain warnings in `customer-dashboard.component.ts` are not critical
- They can be ignored for testing purposes

### Database Errors
- If database doesn't exist:
  ```powershell
  cd PropertyHub.API
  dotnet ef database update
  ```

### CORS Errors
- Ensure Angular is running on `http://localhost:4200`
- API is configured to accept requests from this origin

---

## 📊 Test Data

The database is seeded with:
- **Countries**: US, UK, AE, CA, AU, SG, JP
- **Regions**: Dubai Marina, Downtown Dubai, Jumeirah, Manhattan, London City
- **Currency Rates**: USD to EUR, GBP, AED, CAD, AUD, SGD, JPY

To add test properties, leads, or customers, use the respective API endpoints via Swagger or create them manually.

---

## 🔑 Key Points

1. **No Authentication Required**: All endpoints are now accessible without tokens
2. **CORS Configured**: Frontend can communicate with backend
3. **Database Ready**: PostgreSQL database with seed data
4. **All Controllers Active**: Dashboard, CustomerPortal, CRM, Properties, Reservations

---

## 📝 Next Steps

1. Start both API and Angular
2. Navigate to `http://localhost:4200/dashboard`
3. Test navigation to different pages
4. Use Swagger UI to test API endpoints
5. Register a test customer and explore the customer portal

---

## 🔒 Re-enabling Authentication

To re-enable authentication later:
1. Uncomment all `// ===== AUTHENTICATION DISABLED =====` sections in `Program.cs`
2. Uncomment `[Authorize]` attributes in controllers
3. Uncomment `AuthGuard` imports and `canActivate` in `app.routes.ts`
4. Uncomment `authInterceptor` in `app.config.ts`

---

**Status**: ✅ Application ready for testing
**Backend**: http://localhost:53951
**Frontend**: http://localhost:4200
**Swagger**: http://localhost:53951/api-docs

