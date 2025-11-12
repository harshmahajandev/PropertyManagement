# PropertyHub Global - Enterprise Property Management Platform

## Overview

PropertyHub Global is a comprehensive property management and CRM platform designed for real estate companies. Built with ASP.NET Core 8.0, Blazor Server, and PostgreSQL, it provides enterprise-grade features for property management, customer relationship management, reservations, analytics, and financial reporting.

## 🚀 Features

### Core Modules

1. **Dashboard Module**
   - Unified analytics dashboard with KPIs
   - Business metrics visualization
   - Real-time performance tracking
   - Multi-currency and multi-country support

2. **Property Management Module** (25+ Features)
   - Comprehensive property portfolio management
   - Interactive property cards with images and details
   - Advanced filtering (project, type, status, location, price, size)
   - Smart search across titles, projects, locations
   - Grid view, Interactive map view, Analytics dashboard view
   - Property performance tracking (views, inquiries, tours, offers)
   - Lead matching with interest scores
   - Range filters for price and size

3. **CRM & Lead Management Module** (20+ Features)
   - AI-enhanced lead scoring (0-100 scale)
   - Visual sales pipeline with drag-and-drop
   - Complete lead lifecycle management
   - Buyer segmentation (HNI, Investor, Retail, Commercial)
   - Budget tracking with multi-currency support
   - Timeline management
   - Communication history tracking
   - Lead-to-customer conversion workflow

4. **Customer Portal Module** (15+ Features)
   - Quick 60-second registration
   - Personalized customer dashboard
   - Profile management with avatar support
   - Property preferences management
   - AI-powered property recommendations
   - Booking history with timeline
   - Communication center with messaging
   - Match reasoning explanations

5. **Reservations & Bookings Module** (15+ Features)
   - Comprehensive reservation dashboard
   - Quick 2-step booking system
   - Dynamic deposit calculation
   - Configurable hold duration (3-30 days)
   - Real-time status updates
   - Payment status tracking
   - Property synchronization
   - CRM integration with automatic lead generation

6. **Analytics & Reporting Module** (25+ Features)
   - Market Intelligence Dashboard
   - Investment Portfolio Dashboard
   - Financial Performance Dashboard
   - ESG Sustainability Dashboard
   - Development Analytics Dashboard
   - 40+ calculation formulas
   - Regional market analysis
   - ROI tracking and visualization

7. **Snagging Process Management Module** (15+ Features)
   - Project management with status tracking
   - Issue tracking with categories and priorities
   - Photo upload for documentation
   - Contractor assignment and management
   - Progress tracking and analytics
   - Timeline management

8. **Financial Reports Module** (15+ Features)
   - Financial summary with EBITDA and ROI
   - Revenue/expense analysis
   - Invoice management
   - Occupancy analysis
   - Budget variance reporting
   - Multi-currency reporting
   - Cash flow analysis
   - PDF and Excel export

## 🛠 Tech Stack

### Backend
- **ASP.NET Core 8.0** - Web API framework
- **Entity Framework Core 8.0** - ORM
- **PostgreSQL** - Primary database
- **ASP.NET Core Identity** - Authentication & authorization

### Frontend
- **Blazor Server** - Interactive web UI
- **MudBlazor** - Material Design component library
- **Radzen Blazor** - Additional UI components

### Libraries & Tools
- **AutoMapper** - Object mapping
- **FluentValidation** - Model validation
- **Serilog** - Structured logging
- **Swashbuckle** - API documentation (Swagger)
- **ClosedXML** - Excel generation
- **QuestPDF** - PDF generation

## 📊 Database Schema

The application includes 35+ database tables across the following categories:

- **Core Tables**: Regions, Countries, Currency Rates
- **Property Tables**: Properties, Global Properties, Projects
- **CRM Tables**: Leads, Global Leads, Customers
- **Customer Portal Tables**: Preferences, Recommendations, Messages
- **Reservation Tables**: Reservations, Bookings, Timeline
- **Analytics Tables**: Global Analytics, Financial Records, Market Intelligence, ESG Metrics
- **Snagging Tables**: Snagging Issues, Contractors
- **Communication Tables**: Notifications, Quick Inquiries

## 🔧 Prerequisites

- **.NET 8.0 SDK** or later
- **PostgreSQL 14+**
- **Visual Studio 2022** or **VS Code**
- **Node.js** (for frontend tooling, optional)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PropertyHub
```

### 2. Configure Database Connection

Update `PropertyHub.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=PropertyHubDb;Username=postgres;Password=your_password"
  }
}
```

### 3. Apply Database Migrations

```bash
cd PropertyHub.API
dotnet ef database update
```

### 4. Run the API

```bash
cd PropertyHub.API
dotnet run
```

API will be available at: `https://localhost:7001`
Swagger documentation: `https://localhost:7001/api-docs`

### 5. Run the Blazor App

```bash
cd PropertyHub.BlazorApp
dotnet run
```

Application will be available at: `https://localhost:5001`

### 6. Default Login Credentials

- **Email**: admin@propertyhub.com
- **Password**: Admin@123456

## 📖 Project Structure

```
PropertyHub/
├── PropertyHub.sln                      # Solution file
├── PropertyHub.Core/                    # Domain models and interfaces
│   ├── Entities/                        # 35+ entity models
│   ├── Enums/                          # Application enumerations
│   ├── Interfaces/                      # Repository interfaces
│   └── Common/                         # Base classes
├── PropertyHub.Infrastructure/          # Data access and external services
│   ├── Data/                           # DbContext and configurations
│   ├── Repositories/                    # Repository implementations
│   └── Services/                       # Infrastructure services
├── PropertyHub.Application/             # Business logic layer
│   ├── Services/                       # Business services with formulas
│   ├── DTOs/                          # Data transfer objects
│   ├── Mappings/                      # AutoMapper profiles
│   └── Validators/                    # FluentValidation rules
├── PropertyHub.API/                    # Web API project
│   ├── Controllers/                   # 65+ API endpoints
│   ├── Middleware/                    # Custom middleware
│   ├── Extensions/                    # Service extensions
│   ├── Program.cs                     # Application entry point
│   └── appsettings.json              # Configuration
├── PropertyHub.BlazorApp/              # Blazor Server application
│   ├── Pages/                        # Blazor pages
│   ├── Components/                   # Reusable components
│   ├── Services/                     # Client services
│   └── wwwroot/                      # Static files
└── PropertyHub.Tests/                  # Unit and integration tests
```

## 🔐 Security Features

- ASP.NET Core Identity with role-based authorization
- Password complexity requirements
- JWT token authentication
- HTTPS enforcement
- CORS configuration
- SQL injection protection via EF Core
- XSS protection

## 📈 Business Logic & Formulas

The application implements 40+ calculation formulas including:

### CRM Formulas
- **Lead Score**: `50 + budget_score + timeline_score + buyer_type_score` (capped at 100)
- **Budget Score**: Tiered scoring based on budget ranges
- **Timeline Score**: Urgency-based scoring
- **Buyer Type Score**: HNI (+20), Investor (+15), etc.

### Analytics Formulas
- **Net Profit**: `total_revenue - total_expenses`
- **Profit Margin**: `(net_profit / total_revenue) × 100`
- **ROI**: `((current_value - initial_value) / initial_value) × 100`
- **Revenue Growth**: `((current - previous) / previous) × 100`
- **EBITDA**: `net_profit + interest + taxes + depreciation + amortization`
- And 35+ more financial, market, and ESG formulas

### Reservation Formulas
- **Deposit Amount**: `property_price × (deposit_percentage / 100)`
- **Hold End Date**: `reservation_date + hold_duration_days`

### Property Analytics
- **Interest Score**: `(views × 0.1) + (inquiries × 2) + (tours × 5) + (offers × 10)`
- **Conversion Rate**: `(offers / inquiries) × 100`
- **Lead Match Score**: `(hni_leads × 3) + (investor_leads × 2) + retail_leads`

## 🌍 Multi-Currency Support

Supported currencies:
- USD (United States Dollar)
- EUR (Euro)
- GBP (British Pound)
- AED (UAE Dirham)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- SGD (Singapore Dollar)
- JPY (Japanese Yen)
- BHD (Bahraini Dinar)

## 📱 API Endpoints

### Property Management
- `POST /api/PropertyManagement/get-properties` - List properties with filters
- `POST /api/PropertyManagement/get-property-details` - Get property details
- `POST /api/PropertyManagement/create-property` - Create new property
- `POST /api/PropertyManagement/search-properties` - Search properties

### CRM
- `POST /api/CRM/get-leads` - List leads with filters
- `POST /api/CRM/create-lead` - Create new lead
- `POST /api/CRM/update-lead` - Update lead information
- `POST /api/CRM/convert-lead` - Convert lead to customer

### Reservations
- `POST /api/Reservation/get-reservations` - List reservations
- `POST /api/Reservation/create-reservation` - Create reservation
- `POST /api/Reservation/update-reservation-status` - Update status
- `POST /api/Reservation/calculate-deposit` - Calculate deposit amount

*Full API documentation available at `/api-docs` when running the application*

## 🧪 Testing

```bash
cd PropertyHub.Tests
dotnet test
```

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Azure App Service and IIS deployment
- [Database Setup](docs/DATABASE_SETUP.md) - PostgreSQL configuration and migrations
- [API Documentation](docs/API_DOCUMENTATION.md) - Complete API reference
- [User Guide](docs/USER_GUIDE.md) - End-user documentation

## 🔄 Development Workflow

### Creating New Migrations

```bash
cd PropertyHub.API
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Updating Models

1. Modify entity in `PropertyHub.Core/Entities/`
2. Create migration
3. Update database
4. Update services and controllers as needed

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string in appsettings.json
- Ensure database user has proper permissions

### Migration Errors
- Delete migrations folder and recreate: `dotnet ef migrations add Initial`
- Check for conflicting entity configurations

### Build Errors
- Clean solution: `dotnet clean`
- Restore packages: `dotnet restore`
- Rebuild: `dotnet build`

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support and questions:
- Email: support@propertyhub.com
- Documentation: /docs
- API Documentation: /api-docs

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Core modules implementation
- ✅ Database schema and migrations
- ✅ API endpoints
- ✅ Blazor UI foundation

### Phase 2 (Upcoming)
- [ ] Mobile app (React Native / MAUI)
- [ ] Advanced AI/ML features with GPT-4.1
- [ ] Real-time notifications with SignalR
- [ ] Advanced reporting with custom dashboards
- [ ] Integration with payment gateways
- [ ] Document management system
- [ ] Email marketing integration

### Phase 3 (Future)
- [ ] Mobile-first PWA
- [ ] Blockchain integration for property records
- [ ] Virtual property tours (VR/AR)
- [ ] Predictive analytics for market trends
- [ ] Multi-tenancy support
- [ ] White-label solution

## 🙏 Acknowledgments

Built with modern .NET technologies and best practices for enterprise-grade real estate management.

---

**PropertyHub Global** - Enterprise Property Management Platform © 2025
