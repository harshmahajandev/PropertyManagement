# PropertyHub Backend API - Quick Reference Guide

## Getting Started (5 Minutes)

### 1. Reset Database
```bash
cd PropertyHub.API
dotnet ef database drop --force
dotnet ef database update
```

### 2. Start API
```bash
cd PropertyHub.API
dotnet run
```
API: http://localhost:53951  
Swagger: http://localhost:53951/api-docs

### 3. Start Angular
```bash
cd PropertyHub.Angular
npm start
```
App: http://localhost:4200

---

## Quick Test Commands

### Register User
```bash
curl -X POST http://localhost:53951/api/Auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","fullName":"Test User","phone":"+1234567890"}'
```

### Login
```bash
curl -X POST http://localhost:53951/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@propertyhub.com"}'
```

### Admin Login
```bash
curl -X POST http://localhost:53951/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@propertyhub.com","password":"Admin@123"}'
```

### Get Dashboard
```bash
curl http://localhost:53951/api/Dashboard/summary
```

### List Properties
```bash
curl -X POST http://localhost:53951/api/properties/list \
  -H "Content-Type: application/json" \
  -d '{"limit":10,"offset":0}'
```

### Get Customer Dashboard (Demo Customer)
```bash
curl http://localhost:53951/api/CustomerPortal/dashboard/c4444444-4444-4444-4444-444444444444
```

---

## Pre-Loaded Demo Data

### Demo Credentials
- **Admin**: `admin@propertyhub.com` / `Admin@123`
- **Customer**: `demo@propertyhub.com` (any/no password)

### Customer IDs
- Demo Customer: `c4444444-4444-4444-4444-444444444444`
- John Smith: `c1111111-1111-1111-1111-111111111111`
- Sarah Johnson: `c2222222-2222-2222-2222-222222222222`
- Ahmed Ali: `c3333333-3333-3333-3333-333333333333`

### Property IDs
- Marina Heights: `b1111111-1111-1111-1111-111111111111`
- Burj Vista Penthouse: `b2222222-2222-2222-2222-222222222222`
- Jumeirah Villa: `b3333333-3333-3333-3333-333333333333`
- Manhattan Condo: `b4444444-4444-4444-4444-444444444444`
- Thames View: `b5555555-5555-5555-5555-555555555555`

---

## API Endpoints Summary

### Authentication (`/api/Auth`)
- POST /register
- POST /login
- POST /refresh
- GET /profile/{id}
- GET /health

### Properties (`/api/properties`)
- POST /list - Get all properties
- GET /{id} - Get property details
- POST / - Create property
- PUT /{id} - Update property
- DELETE /{id} - Delete property
- GET /search - Search properties
- GET /top-performers
- GET /project-stats
- POST /{id}/inquiry
- POST /{id}/tour
- POST /{id}/offer

### Customer Portal (`/api/CustomerPortal`)
- POST /register
- POST /login
- GET /profile/{customerId}
- PUT /profile/{customerId}
- GET /dashboard/{customerId}
- GET /statistics/{customerId}
- GET /preferences/{customerId}
- PUT /preferences/{customerId}
- GET /recommendations/{customerId}
- POST /recommendations/{customerId}/generate
- GET /bookings/{customerId}
- POST /bookings/{customerId}
- GET /messages/{customerId}
- POST /messages/{customerId}/send
- PUT /messages/{messageId}/read
- GET /reservations/{customerId}
- GET /health

### CRM (`/api/crm`)
- POST /leads/list
- GET /leads/{id}
- POST /leads
- PUT /leads/{id}
- DELETE /leads/{id}
- PATCH /leads/{id}/status
- GET /pipeline/stats
- GET /pipeline/{status}
- GET /leads/top
- GET /leads/buyer-types
- POST /leads/calculate-score
- GET /leads/search
- GET /stats/conversion
- POST /leads/{id}/convert

### Dashboard (`/api/Dashboard`)
- GET /summary
- GET /properties/stats
- GET /leads/stats
- GET /reservations/stats
- GET /financial/stats
- GET /activities/recent
- GET /properties/top
- GET /leads/by-segment
- GET /reservations/by-status

### Reservations (`/api/Reservation`)
- POST /get-reservations
- POST /create-reservation
- POST /update-reservation-status
- POST /calculate-deposit

---

## Database Contents

- **Countries**: 7 (USA, UK, UAE, Canada, Australia, Singapore, Japan)
- **Regions**: 7 (Dubai Marina, Downtown Dubai, Jumeirah, Manhattan, London City, etc.)
- **Properties**: 8 (6 Available, 1 Reserved, 1 Sold)
- **Customers**: 4 with full profiles
- **Leads**: 5 with scores 65-95
- **Reservations**: 2 (1 Confirmed, 1 Pending)
- **Bookings**: 3 property viewings
- **Messages**: 2 between customers
- **Recommendations**: 3 with confidence scores

---

## Troubleshooting

### Database Won't Reset
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Force drop
cd PropertyHub.API
dotnet ef database drop --force
dotnet ef database update
```

### API Won't Start
```bash
# Check port
lsof -i :53951

# Clean and rebuild
dotnet clean
dotnet restore
dotnet build
dotnet run
```

### CORS Errors
- Verify Angular is on http://localhost:4200
- Check Program.cs has `app.UseCors("AllowAngular");`
- Ensure CORS is BEFORE authentication middleware

### JWT Token Issues
- Check secret key is 32+ characters
- Verify token format: `Bearer {token}`
- Check token expiration (default 24 hours)

---

## Configuration Files

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=PropertyHubDb;Username=postgres;Password=postgres"
  },
  "JWT": {
    "SecretKey": "YourSuperSecretKeyForJWTTokenGeneration-ChangeThisInProduction-MinLength32Characters!",
    "Issuer": "PropertyHubGlobal",
    "Audience": "PropertyHubClients",
    "ExpirationInMinutes": 1440
  }
}
```

### environment.development.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:53951/api',
  customerTokenKey: 'PropertyHubCustomerToken',
  storageKeys: {
    customerProfile: 'PropertyHubCustomerProfile'
  }
};
```

---

## Documentation

- **Full Guide**: `BACKEND_INTEGRATION_COMPLETE.md`
- **Delivery Summary**: `DELIVERY_SUMMARY.md`
- **Quick Start**: `QUICK_START.md`
- **Project README**: `README.md`

---

## Status: READY FOR TESTING ✅

All backend infrastructure is complete and functional. Start the API and Angular app to begin testing!
