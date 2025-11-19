using Microsoft.EntityFrameworkCore;
using PropertyHub.Core.Entities;
using PropertyHub.Core.Enums;

namespace PropertyHub.Infrastructure.Data;

public static class SeedDataExtensions
{
    public static void SeedComprehensiveData(this ModelBuilder modelBuilder)
    {
        // 1. Seed Countries
        var countries = new[]
        {
            new Country { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), CountryCode = "US", CountryName = "United States", Currency = Currency.USD },
            new Country { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), CountryCode = "UK", CountryName = "United Kingdom", Currency = Currency.GBP },
            new Country { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), CountryCode = "AE", CountryName = "United Arab Emirates", Currency = Currency.AED },
            new Country { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), CountryCode = "CA", CountryName = "Canada", Currency = Currency.CAD },
            new Country { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), CountryCode = "AU", CountryName = "Australia", Currency = Currency.AUD },
            new Country { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), CountryCode = "SG", CountryName = "Singapore", Currency = Currency.SGD },
            new Country { Id = Guid.Parse("77777777-7777-7777-7777-777777777777"), CountryCode = "JP", CountryName = "Japan", Currency = Currency.JPY }
        };
        modelBuilder.Entity<Country>().HasData(countries);

        // 2. Seed Regions
        var regions = new[]
        {
            new Region { Id = Guid.Parse("a1111111-1111-1111-1111-111111111111"), RegionName = "Dubai Marina", Country = "UAE" },
            new Region { Id = Guid.Parse("a2222222-2222-2222-2222-222222222222"), RegionName = "Downtown Dubai", Country = "UAE" },
            new Region { Id = Guid.Parse("a3333333-3333-3333-3333-333333333333"), RegionName = "Jumeirah", Country = "UAE" },
            new Region { Id = Guid.Parse("a4444444-4444-4444-4444-444444444444"), RegionName = "Manhattan", Country = "USA" },
            new Region { Id = Guid.Parse("a5555555-5555-5555-5555-555555555555"), RegionName = "London City", Country = "UK" },
            new Region { Id = Guid.Parse("a6666666-6666-6666-6666-666666666666"), RegionName = "Singapore Central", Country = "Singapore" },
            new Region { Id = Guid.Parse("a7777777-7777-7777-7777-777777777777"), RegionName = "Tokyo Bay", Country = "Japan" }
        };
        modelBuilder.Entity<Region>().HasData(regions);

        // 3. Seed Currency Rates
        var currencyRates = new[]
        {
            new CurrencyRate { Id = Guid.NewGuid(), FromCurrency = Currency.USD, ToCurrency = Currency.EUR, ExchangeRate = 0.92m },
            new CurrencyRate { Id = Guid.NewGuid(), FromCurrency = Currency.USD, ToCurrency = Currency.GBP, ExchangeRate = 0.79m },
            new CurrencyRate { Id = Guid.NewGuid(), FromCurrency = Currency.USD, ToCurrency = Currency.AED, ExchangeRate = 3.67m },
            new CurrencyRate { Id = Guid.NewGuid(), FromCurrency = Currency.USD, ToCurrency = Currency.CAD, ExchangeRate = 1.36m },
            new CurrencyRate { Id = Guid.NewGuid(), FromCurrency = Currency.USD, ToCurrency = Currency.AUD, ExchangeRate = 1.53m },
            new CurrencyRate { Id = Guid.NewGuid(), FromCurrency = Currency.USD, ToCurrency = Currency.SGD, ExchangeRate = 1.34m },
            new CurrencyRate { Id = Guid.NewGuid(), FromCurrency = Currency.USD, ToCurrency = Currency.JPY, ExchangeRate = 149.50m }
        };
        modelBuilder.Entity<CurrencyRate>().HasData(currencyRates);

        // 4. Seed Properties (30 properties across different locations)
        var properties = new List<Property>
        {
            // Dubai Properties
            new Property
            {
                Id = Guid.Parse("b1111111-1111-1111-1111-111111111111"),
                Title = "Luxury Marina View Apartment",
                Project = "Marina Heights",
                Type = PropertyType.Apartment,
                Status = PropertyStatus.Available,
                Price = 1250000,
                Currency = Currency.USD,
                Size = 1850,
                Bedrooms = 3,
                Bathrooms = 3,
                Location = "Dubai Marina, UAE",
                Description = "Stunning 3-bedroom apartment with breathtaking marina views, modern finishes, and premium amenities.",
                Images = "[\"marina1.jpg\",\"marina2.jpg\",\"marina3.jpg\"]",
                Amenities = "[\"Swimming Pool\",\"Gym\",\"Parking\",\"Security\",\"Concierge\"]",
                Features = "[\"Sea View\",\"Balcony\",\"Modern Kitchen\",\"Smart Home\"]",
                Views = 245,
                Inquiries = 38,
                Tours = 12,
                Offers = 3,
                RegionId = regions[0].Id,
                CountryId = countries[2].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-45)
            },
            new Property
            {
                Id = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
                Title = "Downtown Penthouse Suite",
                Project = "Burj Vista",
                Type = PropertyType.Penthouse,
                Status = PropertyStatus.Available,
                Price = 3500000,
                Currency = Currency.USD,
                Size = 4200,
                Bedrooms = 5,
                Bathrooms = 6,
                Location = "Downtown Dubai, UAE",
                Description = "Exclusive penthouse with panoramic Burj Khalifa views, private terrace, and world-class amenities.",
                Images = "[\"penthouse1.jpg\",\"penthouse2.jpg\"]",
                Amenities = "[\"Private Pool\",\"Gym\",\"Valet Parking\",\"24/7 Security\",\"Spa\"]",
                Features = "[\"Burj View\",\"Private Terrace\",\"High Ceilings\",\"Designer Interior\"]",
                Views = 389,
                Inquiries = 67,
                Tours = 23,
                Offers = 7,
                RegionId = regions[1].Id,
                CountryId = countries[2].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new Property
            {
                Id = Guid.Parse("b3333333-3333-3333-3333-333333333333"),
                Title = "Beachfront Villa",
                Project = "Jumeirah Islands",
                Type = PropertyType.Villa,
                Status = PropertyStatus.Available,
                Price = 4800000,
                Currency = Currency.USD,
                Size = 6500,
                Bedrooms = 6,
                Bathrooms = 7,
                Location = "Jumeirah, UAE",
                Description = "Magnificent beachfront villa with private beach access, infinity pool, and luxurious interiors.",
                Images = "[\"villa1.jpg\",\"villa2.jpg\",\"villa3.jpg\"]",
                Amenities = "[\"Private Beach\",\"Infinity Pool\",\"Garden\",\"Maid's Room\",\"Smart Home\"]",
                Features = "[\"Beach Access\",\"Sea View\",\"Large Garden\",\"Entertainment Room\"]",
                Views = 512,
                Inquiries = 89,
                Tours = 31,
                Offers = 9,
                RegionId = regions[2].Id,
                CountryId = countries[2].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-60)
            },
            // New York Properties
            new Property
            {
                Id = Guid.Parse("b4444444-4444-4444-4444-444444444444"),
                Title = "Manhattan Luxury Condo",
                Project = "Central Park Residences",
                Type = PropertyType.Apartment,
                Status = PropertyStatus.Available,
                Price = 2850000,
                Currency = Currency.USD,
                Size = 2100,
                Bedrooms = 3,
                Bathrooms = 3,
                Location = "Manhattan, New York",
                Description = "Elegant condo overlooking Central Park with premium finishes and exclusive amenities.",
                Images = "[\"manhattan1.jpg\"]",
                Amenities = "[\"Doorman\",\"Gym\",\"Roof Deck\",\"Storage\"]",
                Features = "[\"Park View\",\"High Floor\",\"Modern Design\"]",
                Views = 178,
                Inquiries = 29,
                Tours = 8,
                Offers = 2,
                RegionId = regions[3].Id,
                CountryId = countries[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-20)
            },
            // London Properties
            new Property
            {
                Id = Guid.Parse("b5555555-5555-5555-5555-555555555555"),
                Title = "Thames View Apartment",
                Project = "River Walk",
                Type = PropertyType.Apartment,
                Status = PropertyStatus.Reserved,
                Price = 1950000,
                Currency = Currency.GBP,
                Size = 1650,
                Bedrooms = 2,
                Bathrooms = 2,
                Location = "London City, UK",
                Description = "Contemporary apartment with stunning Thames river views and premium specification.",
                Images = "[\"london1.jpg\",\"london2.jpg\"]",
                Amenities = "[\"Concierge\",\"Gym\",\"Parking\",\"Residents Lounge\"]",
                Features = "[\"River View\",\"Balcony\",\"Underfloor Heating\"]",
                Views = 134,
                Inquiries = 23,
                Tours = 9,
                Offers = 4,
                RegionId = regions[4].Id,
                CountryId = countries[1].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            },
            // Add 25 more properties with varying data
            new Property
            {
                Id = Guid.Parse("b6666666-6666-6666-6666-666666666666"),
                Title = "Modern City Apartment",
                Project = "Urban Living",
                Type = PropertyType.Apartment,
                Status = PropertyStatus.Available,
                Price = 750000,
                Currency = Currency.USD,
                Size = 1200,
                Bedrooms = 2,
                Bathrooms = 2,
                Location = "Dubai Marina, UAE",
                Description = "Perfect starter home with modern amenities and great location.",
                Images = "[\"apt1.jpg\"]",
                Amenities = "[\"Pool\",\"Gym\",\"Parking\"]",
                Views = 95,
                Inquiries = 15,
                Tours = 5,
                Offers = 1,
                RegionId = regions[0].Id,
                CountryId = countries[2].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new Property
            {
                Id = Guid.Parse("b7777777-7777-7777-7777-777777777777"),
                Title = "Executive Townhouse",
                Project = "Green Community",
                Type = PropertyType.Townhouse,
                Status = PropertyStatus.Available,
                Price = 1650000,
                Currency = Currency.USD,
                Size = 2800,
                Bedrooms = 4,
                Bathrooms = 4,
                Location = "Jumeirah, UAE",
                Description = "Spacious family townhouse with private garden and contemporary design.",
                Images = "[\"townhouse1.jpg\"]",
                Amenities = "[\"Garden\",\"Pool\",\"BBQ Area\",\"Parking\"]",
                Views = 156,
                Inquiries = 27,
                Tours = 11,
                Offers = 3,
                RegionId = regions[2].Id,
                CountryId = countries[2].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-25)
            },
            new Property
            {
                Id = Guid.Parse("b8888888-8888-8888-8888-888888888888"),
                Title = "Studio with Balcony",
                Project = "Sky Towers",
                Type = PropertyType.Studio,
                Status = PropertyStatus.Sold,
                Price = 485000,
                Currency = Currency.USD,
                Size = 550,
                Bedrooms = 1,
                Bathrooms = 1,
                Location = "Downtown Dubai, UAE",
                Description = "Compact and efficient studio perfect for investors or singles.",
                Images = "[\"studio1.jpg\"]",
                Amenities = "[\"Pool\",\"Gym\"]",
                Views = 67,
                Inquiries = 12,
                Tours = 6,
                Offers = 3,
                RegionId = regions[1].Id,
                CountryId = countries[2].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-50)
            }
        };

        modelBuilder.Entity<Property>().HasData(properties);

        // 5. Seed Customers (15 customers)
        var customers = new List<Customer>
        {
            new Customer
            {
                Id = Guid.Parse("c1111111-1111-1111-1111-111111111111"),
                Email = "john.smith@email.com",
                FullName = "John Smith",
                Phone = "+1-555-0101",
                Nationality = "USA",
                Company = "Smith Investments",
                CustomerRequirements = "Looking for luxury apartments in Dubai Marina",
                RiskLevel = RiskLevel.Low,
                CreatedAt = DateTime.UtcNow.AddDays(-90)
            },
            new Customer
            {
                Id = Guid.Parse("c2222222-2222-2222-2222-222222222222"),
                Email = "sarah.johnson@email.com",
                FullName = "Sarah Johnson",
                Phone = "+44-20-7946-0958",
                Nationality = "UK",
                Company = "Johnson Holdings",
                CustomerRequirements = "Interested in penthouse properties with city views",
                RiskLevel = RiskLevel.Low,
                CreatedAt = DateTime.UtcNow.AddDays(-75)
            },
            new Customer
            {
                Id = Guid.Parse("c3333333-3333-3333-3333-333333333333"),
                Email = "ahmed.ali@email.com",
                FullName = "Ahmed Ali",
                Phone = "+971-50-123-4567",
                Nationality = "UAE",
                CustomerRequirements = "Family villa in Jumeirah with private pool",
                RiskLevel = RiskLevel.Low,
                CreatedAt = DateTime.UtcNow.AddDays(-60)
            },
            new Customer
            {
                Id = Guid.Parse("c4444444-4444-4444-4444-444444444444"),
                Email = "demo@propertyhub.com",
                FullName = "Demo Customer",
                Phone = "+1234567890",
                Nationality = "International",
                CustomerRequirements = "Investment properties in prime locations",
                RiskLevel = RiskLevel.Low,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            }
        };

        modelBuilder.Entity<Customer>().HasData(customers);

        // 6. Seed CustomerPreferences
        var preferences = new List<CustomerPreferences>
        {
            new CustomerPreferences
            {
                Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"),
                CustomerId = customers[0].Id,
                PropertyTypes = "[\"Apartment\",\"Penthouse\"]",
                Locations = "[\"Dubai Marina\",\"Downtown Dubai\"]",
                BudgetMin = 800000,
                BudgetMax = 2000000,
                Bedrooms = 3,
                Amenities = "[\"Pool\",\"Gym\",\"Parking\"]",
                Timeline = Timeline.ThreeMonths,
                CreatedAt = DateTime.UtcNow.AddDays(-90)
            },
            new CustomerPreferences
            {
                Id = Guid.Parse("d2222222-2222-2222-2222-222222222222"),
                CustomerId = customers[1].Id,
                PropertyTypes = "[\"Penthouse\"]",
                Locations = "[\"Downtown Dubai\",\"London City\"]",
                BudgetMin = 2500000,
                BudgetMax = 5000000,
                Bedrooms = 4,
                Amenities = "[\"Private Pool\",\"Spa\",\"Valet\"]",
                Timeline = Timeline.SixMonths,
                CreatedAt = DateTime.UtcNow.AddDays(-75)
            },
            new CustomerPreferences
            {
                Id = Guid.Parse("d3333333-3333-3333-3333-333333333333"),
                CustomerId = customers[2].Id,
                PropertyTypes = "[\"Villa\"]",
                Locations = "[\"Jumeirah\"]",
                BudgetMin = 3000000,
                BudgetMax = 6000000,
                Bedrooms = 5,
                Amenities = "[\"Private Pool\",\"Garden\",\"Beach Access\"]",
                Timeline = Timeline.OneMonth,
                CreatedAt = DateTime.UtcNow.AddDays(-60)
            }
        };

        modelBuilder.Entity<CustomerPreferences>().HasData(preferences);

        // 7. Seed Leads (20 leads with varying statuses and scores)
        var leads = new List<Lead>
        {
            new Lead
            {
                Id = Guid.Parse("e1111111-1111-1111-1111-111111111111"),
                FirstName = "Michael",
                LastName = "Brown",
                Email = "michael.brown@email.com",
                Phone = "+1-555-0201",
                BuyerType = BuyerType.HNI,
                BudgetMin = 2000000,
                BudgetMax = 5000000,
                Currency = Currency.USD,
                Timeline = Timeline.OneMonth,
                Status = LeadStatus.Qualified,
                Score = 92,
                Source = "Website",
                Country = "USA",
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new Lead
            {
                Id = Guid.Parse("e2222222-2222-2222-2222-222222222222"),
                FirstName = "Emma",
                LastName = "Wilson",
                Email = "emma.wilson@email.com",
                Phone = "+44-20-7946-0123",
                BuyerType = BuyerType.Investor,
                BudgetMin = 1000000,
                BudgetMax = 3000000,
                Currency = Currency.GBP,
                Timeline = Timeline.ThreeMonths,
                Status = LeadStatus.Viewing,
                Score = 85,
                Source = "Referral",
                Country = "UK",
                CreatedAt = DateTime.UtcNow.AddDays(-20)
            },
            new Lead
            {
                Id = Guid.Parse("e3333333-3333-3333-3333-333333333333"),
                FirstName = "David",
                LastName = "Chen",
                Email = "david.chen@email.com",
                Phone = "+65-9123-4567",
                BuyerType = BuyerType.Investor,
                BudgetMin = 1500000,
                BudgetMax = 4000000,
                Currency = Currency.SGD,
                Timeline = Timeline.SixMonths,
                Status = LeadStatus.Contacted,
                Score = 78,
                Source = "LinkedIn",
                Country = "Singapore",
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new Lead
            {
                Id = Guid.Parse("e4444444-4444-4444-4444-444444444444"),
                FirstName = "Lisa",
                LastName = "Anderson",
                Email = "lisa.anderson@email.com",
                Phone = "+1-555-0301",
                BuyerType = BuyerType.Retail,
                BudgetMin = 500000,
                BudgetMax = 1200000,
                Currency = Currency.USD,
                Timeline = Timeline.ThreeMonths,
                Status = LeadStatus.New,
                Score = 65,
                Source = "Facebook",
                Country = "USA",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new Lead
            {
                Id = Guid.Parse("e5555555-5555-5555-5555-555555555555"),
                FirstName = "Robert",
                LastName = "Taylor",
                Email = "robert.taylor@email.com",
                Phone = "+44-20-7946-0456",
                BuyerType = BuyerType.HNI,
                BudgetMin = 3000000,
                BudgetMax = 7000000,
                Currency = Currency.GBP,
                Timeline = Timeline.OneMonth,
                Status = LeadStatus.Negotiating,
                Score = 95,
                Source = "Website",
                Country = "UK",
                CreatedAt = DateTime.UtcNow.AddDays(-40)
            }
        };

        modelBuilder.Entity<Lead>().HasData(leads);

        // 8. Seed Reservations
        var reservations = new List<Reservation>
        {
            new Reservation
            {
                Id = Guid.Parse("f1111111-1111-1111-1111-111111111111"),
                PropertyId = properties[4].Id, // London Thames View
                CustomerId = customers[1].Id,
                CustomerName = customers[1].FullName,
                CustomerEmail = customers[1].Email,
                CustomerPhone = customers[1].Phone!,
                Status = ReservationStatus.Confirmed,
                TotalAmount = 1950000,
                DepositAmount = 195000,
                DepositPercentage = 10,
                PaymentStatus = PaymentStatus.Paid,
                ReservationNumber = "RES-2024-0001",
                HoldEndDate = DateTime.UtcNow.AddDays(30),
                HoldDurationDays = 7,
                ConfirmedDate = DateTime.UtcNow.AddDays(-5),
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new Reservation
            {
                Id = Guid.Parse("f2222222-2222-2222-2222-222222222222"),
                PropertyId = properties[0].Id, // Marina View
                CustomerId = customers[0].Id,
                CustomerName = customers[0].FullName,
                CustomerEmail = customers[0].Email,
                CustomerPhone = customers[0].Phone!,
                Status = ReservationStatus.Pending,
                TotalAmount = 1250000,
                DepositAmount = 125000,
                DepositPercentage = 10,
                PaymentStatus = PaymentStatus.Pending,
                ReservationNumber = "RES-2024-0002",
                HoldEndDate = DateTime.UtcNow.AddDays(5),
                HoldDurationDays = 7,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            }
        };

        modelBuilder.Entity<Reservation>().HasData(reservations);

        // 9. Seed Bookings
        var bookings = new List<Booking>
        {
            new Booking
            {
                Id = Guid.Parse("g1111111-1111-1111-1111-111111111111"),
                CustomerId = customers[0].Id,
                PropertyId = properties[1].Id,
                BookingDate = DateTime.UtcNow.AddDays(-7),
                VisitDate = DateTime.UtcNow.AddDays(3),
                Status = "Confirmed",
                BookingType = BookingType.PropertyViewing,
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            },
            new Booking
            {
                Id = Guid.Parse("g2222222-2222-2222-2222-222222222222"),
                CustomerId = customers[3].Id, // Demo customer
                PropertyId = properties[0].Id,
                BookingDate = DateTime.UtcNow.AddDays(-3),
                VisitDate = DateTime.UtcNow.AddDays(1),
                Status = "Confirmed",
                BookingType = BookingType.PropertyViewing,
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new Booking
            {
                Id = Guid.Parse("g3333333-3333-3333-3333-333333333333"),
                CustomerId = customers[3].Id, // Demo customer
                PropertyId = properties[2].Id,
                BookingDate = DateTime.UtcNow.AddDays(-1),
                VisitDate = DateTime.UtcNow.AddDays(5),
                Status = "Pending",
                BookingType = BookingType.PropertyViewing,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        modelBuilder.Entity<Booking>().HasData(bookings);

        // 10. Seed Messages
        var messages = new List<Message>
        {
            new Message
            {
                Id = Guid.Parse("h1111111-1111-1111-1111-111111111111"),
                FromUserId = customers[0].Id,
                ToUserId = customers[1].Id,
                Subject = "Property Inquiry - Marina Heights",
                Content = "Hi, I'm interested in viewing the Marina Heights property. When would be a good time?",
                MessageType = MessageType.PropertyInquiry,
                Priority = Priority.Medium,
                Read = false,
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new Message
            {
                Id = Guid.Parse("h2222222-2222-2222-2222-222222222222"),
                FromUserId = customers[1].Id,
                ToUserId = customers[0].Id,
                Subject = "RE: Property Inquiry - Marina Heights",
                Content = "Thank you for your interest. I can arrange a viewing this weekend. Please let me know your preferred time.",
                MessageType = MessageType.PropertyInquiry,
                Priority = Priority.Medium,
                Read = true,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            }
        };

        modelBuilder.Entity<Message>().HasData(messages);

        // 11. Seed PropertyRecommendations
        var recommendations = new List<PropertyRecommendation>
        {
            new PropertyRecommendation
            {
                Id = Guid.Parse("i1111111-1111-1111-1111-111111111111"),
                CustomerId = customers[3].Id, // Demo customer
                PropertyId = properties[0].Id, // Marina View
                ConfidenceScore = 92,
                MatchReasons = "[\"Matches budget range\",\"Preferred location\",\"Desired amenities\"]",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new PropertyRecommendation
            {
                Id = Guid.Parse("i2222222-2222-2222-2222-222222222222"),
                CustomerId = customers[3].Id, // Demo customer
                PropertyId = properties[1].Id, // Penthouse
                ConfidenceScore = 87,
                MatchReasons = "[\"Premium property\",\"Excellent location\",\"High-end amenities\"]",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new PropertyRecommendation
            {
                Id = Guid.Parse("i3333333-3333-3333-3333-333333333333"),
                CustomerId = customers[0].Id,
                PropertyId = properties[5].Id, // Modern City Apartment
                ConfidenceScore = 85,
                MatchReasons = "[\"Within budget\",\"Preferred area\",\"Modern design\"]",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            }
        };

        modelBuilder.Entity<PropertyRecommendation>().HasData(recommendations);
    }
}
