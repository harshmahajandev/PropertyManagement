using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PropertyHub.Core.Entities;

namespace PropertyHub.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Core Tables
    public DbSet<Region> Regions { get; set; } = null!;
    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<CurrencyRate> CurrencyRates { get; set; } = null!;

    // Property Management Tables
    public DbSet<Property> Properties { get; set; } = null!;
    public DbSet<GlobalProperty> GlobalProperties { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;

    // CRM & Lead Management Tables
    public DbSet<Lead> Leads { get; set; } = null!;
    public DbSet<GlobalLead> GlobalLeads { get; set; } = null!;
    public DbSet<Customer> Customers { get; set; } = null!;

    // Customer Portal Tables
    public DbSet<CustomerPreferences> CustomerPreferences { get; set; } = null!;
    public DbSet<CustomerPortalPreferences> CustomerPortalPreferences { get; set; } = null!;
    public DbSet<PropertyRecommendation> PropertyRecommendations { get; set; } = null!;
    public DbSet<CustomerPortalRecommendation> CustomerPortalRecommendations { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;

    // Reservations & Bookings Tables
    public DbSet<Reservation> Reservations { get; set; } = null!;
    public DbSet<GlobalReservation> GlobalReservations { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<CustomerPortalBooking> CustomerPortalBookings { get; set; } = null!;
    public DbSet<BookingPreference> BookingPreferences { get; set; } = null!;
    public DbSet<ReservationTimeline> ReservationTimelines { get; set; } = null!;

    // Analytics Tables
    public DbSet<GlobalAnalytics> GlobalAnalytics { get; set; } = null!;
    public DbSet<FinancialRecord> FinancialRecords { get; set; } = null!;
    public DbSet<FinancialReport> FinancialReports { get; set; } = null!;
    public DbSet<MarketIntelligence> MarketIntelligence { get; set; } = null!;
    public DbSet<InvestmentPortfolio> InvestmentPortfolios { get; set; } = null!;
    public DbSet<ESGMetric> ESGMetrics { get; set; } = null!;

    // Snagging Management Tables
    public DbSet<SnaggingIssue> SnaggingIssues { get; set; } = null!;
    public DbSet<Contractor> Contractors { get; set; } = null!;

    // Notification & Communication Tables
    public DbSet<GlobalNotification> GlobalNotifications { get; set; } = null!;
    public DbSet<QuickInquiry> QuickInquiries { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Property configurations
        modelBuilder.Entity<Property>(entity =>
        {
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.Price);
            entity.HasIndex(e => e.Location);
            
            entity.HasOne(e => e.Region)
                .WithMany(r => r.Properties)
                .HasForeignKey(e => e.RegionId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasOne(e => e.Country)
                .WithMany(c => c.Properties)
                .HasForeignKey(e => e.CountryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Customer configurations
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Phone);
            
            entity.HasOne(e => e.Preferences)
                .WithOne(p => p.Customer)
                .HasForeignKey<CustomerPreferences>(p => p.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Message configurations
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasOne(m => m.FromUser)
                .WithMany(c => c.SentMessages)
                .HasForeignKey(m => m.FromUserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(m => m.ToUser)
                .WithMany(c => c.ReceivedMessages)
                .HasForeignKey(m => m.ToUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Reservation configurations
        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasIndex(e => e.ReservationNumber).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CustomerEmail);
            
            entity.HasOne(e => e.Property)
                .WithMany(p => p.Reservations)
                .HasForeignKey(e => e.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Reservations)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Booking configurations
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Bookings)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Property Recommendation configurations
        modelBuilder.Entity<PropertyRecommendation>(entity =>
        {
            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Property)
                .WithMany(p => p.Recommendations)
                .HasForeignKey(e => e.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Lead configurations
        modelBuilder.Entity<Lead>(entity =>
        {
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Score);
        });

        // Snagging Issue configurations
        modelBuilder.Entity<SnaggingIssue>(entity =>
        {
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Priority);
            entity.HasIndex(e => e.Category);
            
            entity.HasOne(e => e.Contractor)
                .WithMany(c => c.Issues)
                .HasForeignKey(e => e.ContractorId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Contractor configurations
        modelBuilder.Entity<Contractor>(entity =>
        {
            entity.HasIndex(e => e.CompanyName);
            entity.HasIndex(e => e.Email);
        });

        // Financial Record configurations
        modelBuilder.Entity<FinancialRecord>(entity =>
        {
            entity.HasIndex(e => e.TransactionDate);
            entity.HasIndex(e => e.TransactionType);
        });

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Use comprehensive seed data
        modelBuilder.SeedComprehensiveData();
    }
}
