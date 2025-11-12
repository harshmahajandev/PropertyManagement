using System.ComponentModel.DataAnnotations;
using PropertyHub.Core.Common;
using PropertyHub.Core.Enums;

namespace PropertyHub.Core.Entities;

// ==================== CORE ENTITIES ====================

public class Region : BaseEntity
{
    [Required, StringLength(200)]
    public string RegionName { get; set; } = string.Empty;
    
    [Required, StringLength(100)]
    public string Country { get; set; } = string.Empty;
    
    public ICollection<Property> Properties { get; set; } = new List<Property>();
}

public class Country : BaseEntity
{
    [Required, StringLength(10)]
    public string CountryCode { get; set; } = string.Empty;
    
    [Required, StringLength(100)]
    public string CountryName { get; set; } = string.Empty;
    
    public Currency Currency { get; set; }
    
    public ICollection<Property> Properties { get; set; } = new List<Property>();
}

public class CurrencyRate : BaseEntity
{
    public Currency FromCurrency { get; set; }
    
    public Currency ToCurrency { get; set; }
    
    public decimal ExchangeRate { get; set; }
}

// ==================== PROPERTY MANAGEMENT ENTITIES ====================

public class Property : AuditableEntity
{
    [Required, StringLength(300)]
    public string Title { get; set; } = string.Empty;
    
    [Required, StringLength(200)]
    public string Project { get; set; } = string.Empty;
    
    public PropertyType Type { get; set; }
    
    public PropertyStatus Status { get; set; }
    
    [Required]
    public decimal Price { get; set; }
    
    public Currency Currency { get; set; }
    
    public decimal Size { get; set; }
    
    public int Bedrooms { get; set; }
    
    public int Bathrooms { get; set; }
    
    [Required, StringLength(200)]
    public string Location { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    // JSON arrays stored as strings
    public string? Images { get; set; }
    
    public string? Amenities { get; set; }
    
    public string? Features { get; set; }
    
    // Geolocation
    public double? Latitude { get; set; }
    
    public double? Longitude { get; set; }
    
    // Performance tracking
    public int Views { get; set; }
    
    public int Inquiries { get; set; }
    
    public int Tours { get; set; }
    
    public int Offers { get; set; }
    
    // Foreign keys
    public Guid? RegionId { get; set; }
    public Region? Region { get; set; }
    
    public Guid? CountryId { get; set; }
    public Country? Country { get; set; }
    
    // Navigation properties
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<PropertyRecommendation> Recommendations { get; set; } = new List<PropertyRecommendation>();
}

public class GlobalProperty : AuditableEntity
{
    [Required, StringLength(300)]
    public string PropertyName { get; set; } = string.Empty;
    
    public PropertyType PropertyType { get; set; }
    
    public PropertyStatus Status { get; set; }
    
    public decimal Price { get; set; }
    
    public Currency Currency { get; set; }
    
    [Required, StringLength(200)]
    public string Location { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Country { get; set; }
    
    [StringLength(100)]
    public string? Region { get; set; }
    
    public decimal Size { get; set; }
    
    public int Bedrooms { get; set; }
    
    public int Bathrooms { get; set; }
    
    public string? Images { get; set; }
}

public class Project : AuditableEntity
{
    [Required, StringLength(200)]
    public string ProjectName { get; set; } = string.Empty;
    
    [StringLength(200)]
    public string? Developer { get; set; }
    
    public ProjectStatus Status { get; set; }
    
    [StringLength(200)]
    public string? Location { get; set; }
    
    public int TotalUnits { get; set; }
    
    public int AvailableUnits { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? CompletionDate { get; set; }
}

// ==================== CRM & LEAD MANAGEMENT ENTITIES ====================

public class Lead : AuditableEntity
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Phone { get; set; }
    
    public BuyerType BuyerType { get; set; }
    
    public decimal? BudgetMin { get; set; }
    
    public decimal? BudgetMax { get; set; }
    
    public Currency Currency { get; set; }
    
    public Timeline Timeline { get; set; }
    
    public LeadStatus Status { get; set; }
    
    // Lead scoring (0-100)
    public int Score { get; set; }
    
    [StringLength(100)]
    public string? Source { get; set; }
    
    public string? Notes { get; set; }
    
    [StringLength(100)]
    public string? Country { get; set; }
}

public class GlobalLead : AuditableEntity
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Phone { get; set; }
    
    [StringLength(100)]
    public string? Country { get; set; }
    
    public BuyerType BuyerType { get; set; }
    
    [StringLength(100)]
    public string? BudgetRange { get; set; }
    
    public LeadStatus Status { get; set; }
    
    public int LeadScore { get; set; }
    
    [StringLength(100)]
    public string? Source { get; set; }
}

public class Customer : AuditableEntity
{
    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [Required, StringLength(200)]
    public string FullName { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Phone { get; set; }
    
    [StringLength(100)]
    public string? Nationality { get; set; }
    
    [StringLength(200)]
    public string? Company { get; set; }
    
    public string? CustomerRequirements { get; set; }
    
    public RiskLevel RiskLevel { get; set; }
    
    public DateTime? ConversionDate { get; set; }
    
    // Navigation properties
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
    public CustomerPreferences? Preferences { get; set; }
}

// ==================== CUSTOMER PORTAL ENTITIES ====================

public class CustomerPreferences : AuditableEntity
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    public string? PropertyTypes { get; set; }
    
    public string? Locations { get; set; }
    
    public decimal? BudgetMin { get; set; }
    
    public decimal? BudgetMax { get; set; }
    
    public int? Bedrooms { get; set; }
    
    public int? Bathrooms { get; set; }
    
    public string? Amenities { get; set; }
    
    public Timeline Timeline { get; set; }
}

public class CustomerPortalPreferences : AuditableEntity
{
    public Guid CustomerId { get; set; }
    
    public string? PropertyTypes { get; set; }
    
    public string? Locations { get; set; }
    
    [StringLength(100)]
    public string? BudgetRange { get; set; }
    
    public string? Amenities { get; set; }
    
    public Timeline Timeline { get; set; }
}

public class PropertyRecommendation : AuditableEntity
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;
    
    public int ConfidenceScore { get; set; }
    
    public string? MatchReasons { get; set; }
    
    [StringLength(50)]
    public string? Status { get; set; }
}

public class CustomerPortalRecommendation : AuditableEntity
{
    public Guid CustomerId { get; set; }
    
    public Guid PropertyId { get; set; }
    
    public int ConfidenceScore { get; set; }
    
    public string? MatchReasons { get; set; }
}

public class Message : BaseEntity
{
    public Guid FromUserId { get; set; }
    public Customer FromUser { get; set; } = null!;
    
    public Guid ToUserId { get; set; }
    public Customer ToUser { get; set; } = null!;
    
    [Required, StringLength(300)]
    public string Subject { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public MessageType MessageType { get; set; }
    
    public Priority Priority { get; set; }
    
    public bool Read { get; set; }
}

// ==================== RESERVATION & BOOKING ENTITIES ====================

public class Reservation : AuditableEntity
{
    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;
    
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    
    [Required, StringLength(200)]
    public string CustomerName { get; set; } = string.Empty;
    
    [Required, EmailAddress, StringLength(200)]
    public string CustomerEmail { get; set; } = string.Empty;
    
    [Required, StringLength(50)]
    public string CustomerPhone { get; set; } = string.Empty;
    
    public ReservationStatus Status { get; set; }
    
    public decimal TotalAmount { get; set; }
    
    public decimal DepositAmount { get; set; }
    
    public decimal DepositPercentage { get; set; }
    
    public PaymentStatus PaymentStatus { get; set; }
    
    [StringLength(50)]
    public string? ReservationNumber { get; set; }
    
    public DateTime? PreferredMoveDate { get; set; }
    
    [StringLength(100)]
    public string? BudgetRange { get; set; }
    
    public string? SpecialRequirements { get; set; }
    
    public DateTime? HoldEndDate { get; set; }
    
    public int HoldDurationDays { get; set; }
    
    public DateTime? ConfirmedDate { get; set; }
    
    public DateTime? CancelledDate { get; set; }
    
    public string? Notes { get; set; }
}

public class GlobalReservation : AuditableEntity
{
    public Guid PropertyId { get; set; }
    
    public Guid? CustomerId { get; set; }
    
    public ReservationStatus Status { get; set; }
    
    public DateTime ReservationDate { get; set; }
    
    public DateTime? CheckInDate { get; set; }
    
    public DateTime? CheckOutDate { get; set; }
    
    public decimal TotalAmount { get; set; }
    
    public decimal DepositAmount { get; set; }
    
    public PaymentStatus PaymentStatus { get; set; }
}

public class Booking : AuditableEntity
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    public Guid PropertyId { get; set; }
    
    public DateTime BookingDate { get; set; }
    
    public DateTime VisitDate { get; set; }
    
    [StringLength(50)]
    public string? Status { get; set; }
    
    public decimal? TotalAmount { get; set; }
    
    public BookingType BookingType { get; set; }
}

public class CustomerPortalBooking : AuditableEntity
{
    public Guid CustomerId { get; set; }
    
    public Guid PropertyId { get; set; }
    
    public DateTime BookingDate { get; set; }
    
    public DateTime VisitDate { get; set; }
    
    [StringLength(50)]
    public string? Status { get; set; }
    
    public BookingType BookingType { get; set; }
}

public class BookingPreference : AuditableEntity
{
    public Guid CustomerId { get; set; }
    
    public string? PreferredTimes { get; set; }
    
    public string? SpecialRequirements { get; set; }
}

public class ReservationTimeline : BaseEntity
{
    public Guid ReservationId { get; set; }
    
    [Required, StringLength(100)]
    public string EventType { get; set; } = string.Empty;
    
    public DateTime EventDate { get; set; }
    
    public string? Notes { get; set; }
}

// ==================== ANALYTICS ENTITIES ====================

public class GlobalAnalytics : BaseEntity
{
    [Required, StringLength(100)]
    public string MetricType { get; set; } = string.Empty;
    
    [Required, StringLength(200)]
    public string MetricName { get; set; } = string.Empty;
    
    public decimal MetricValue { get; set; }
    
    public DateTime MetricDate { get; set; }
    
    public Period Period { get; set; }
    
    public Guid? CompanyId { get; set; }
}

public class FinancialRecord : AuditableEntity
{
    public TransactionType TransactionType { get; set; }
    
    public decimal Amount { get; set; }
    
    public Currency Currency { get; set; }
    
    [StringLength(100)]
    public string? Category { get; set; }
    
    public string? Description { get; set; }
    
    public DateTime TransactionDate { get; set; }
    
    public Guid? PropertyId { get; set; }
    
    public Guid? CustomerId { get; set; }
}

public class MarketIntelligence : BaseEntity
{
    [StringLength(100)]
    public string? Region { get; set; }
    
    public PropertyType PropertyType { get; set; }
    
    public decimal AveragePrice { get; set; }
    
    public decimal PriceChange { get; set; }
    
    public int TotalProperties { get; set; }
    
    public int SoldProperties { get; set; }
    
    public DateTime MetricDate { get; set; }
}

public class InvestmentPortfolio : AuditableEntity
{
    public InvestmentType InvestmentType { get; set; }
    
    public decimal InitialValue { get; set; }
    
    public decimal CurrentValue { get; set; }
    
    public decimal RoiPercentage { get; set; }
    
    [StringLength(50)]
    public string? Status { get; set; }
    
    public DateTime PurchaseDate { get; set; }
}

public class ESGMetric : BaseEntity
{
    [Required, StringLength(100)]
    public string MetricType { get; set; } = string.Empty;
    
    [Required, StringLength(200)]
    public string MetricName { get; set; } = string.Empty;
    
    public decimal MetricValue { get; set; }
    
    [StringLength(50)]
    public string? UnitOfMeasure { get; set; }
    
    public decimal? TargetValue { get; set; }
    
    public DateTime MetricDate { get; set; }
    
    public string? Description { get; set; }
}

// ==================== SNAGGING ENTITIES ====================

public class SnaggingIssue : AuditableEntity
{
    public Guid ProjectId { get; set; }
    
    [Required, StringLength(300)]
    public string IssueTitle { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public IssueCategory Category { get; set; }
    
    public IssuePriority Priority { get; set; }
    
    public IssueStatus Status { get; set; }
    
    public Guid? ContractorId { get; set; }
    public Contractor? Contractor { get; set; }
    
    [StringLength(200)]
    public string? Location { get; set; }
    
    public string? Photos { get; set; }
    
    [StringLength(200)]
    public string? ReportedBy { get; set; }
    
    [StringLength(200)]
    public string? AssignedTo { get; set; }
    
    public DateTime? ReportedDate { get; set; }
    
    public DateTime? AssignedDate { get; set; }
    
    public DateTime? ResolvedDate { get; set; }
    
    public DateTime? VerifiedDate { get; set; }
    
    public string? Notes { get; set; }
}

public class Contractor : AuditableEntity
{
    [Required, StringLength(200)]
    public string CompanyName { get; set; } = string.Empty;
    
    [StringLength(200)]
    public string? ContactPerson { get; set; }
    
    [EmailAddress, StringLength(200)]
    public string? Email { get; set; }
    
    [StringLength(50)]
    public string? Phone { get; set; }
    
    public string? Specialties { get; set; }
    
    [StringLength(50)]
    public string? Status { get; set; }
    
    public decimal? Rating { get; set; }
    
    public int TotalProjects { get; set; }
    
    public int CompletedProjects { get; set; }
    
    public int ActiveProjects { get; set; }
    
    public string? Address { get; set; }
    
    [StringLength(100)]
    public string? LicenseNumber { get; set; }
    
    public DateTime? InsuranceValidUntil { get; set; }
    
    public ICollection<SnaggingIssue> Issues { get; set; } = new List<SnaggingIssue>();
}

// ==================== NOTIFICATION & COMMUNICATION ENTITIES ====================

public class GlobalNotification : BaseEntity
{
    public Guid UserId { get; set; }
    
    [Required, StringLength(100)]
    public string NotificationType { get; set; } = string.Empty;
    
    [Required, StringLength(300)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    public bool Read { get; set; }
    
    [StringLength(500)]
    public string? ActionUrl { get; set; }
}

public class QuickInquiry : AuditableEntity
{
    public Guid PropertyId { get; set; }
    
    [Required, StringLength(200)]
    public string CustomerName { get; set; } = string.Empty;
    
    [Required, EmailAddress, StringLength(200)]
    public string CustomerEmail { get; set; } = string.Empty;
    
    [Required, StringLength(50)]
    public string CustomerPhone { get; set; } = string.Empty;
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Status { get; set; }
}

// ==================== FINANCIAL ENTITIES ====================

public class FinancialReport : AuditableEntity
{
    public DateTime ReportDate { get; set; }
    
    public decimal TotalRevenue { get; set; }
    
    public decimal TotalExpenses { get; set; }
    
    public decimal NetProfit { get; set; }
    
    public decimal ProfitMargin { get; set; }
    
    public Currency Currency { get; set; } = Currency.USD;
    
    [StringLength(100)]
    public string ReportType { get; set; } = string.Empty; // Monthly, Quarterly, Annual
    
    [StringLength(500)]
    public string? Notes { get; set; }
}
