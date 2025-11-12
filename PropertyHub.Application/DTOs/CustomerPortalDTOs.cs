using System.ComponentModel.DataAnnotations;
using PropertyHub.Core.Enums;

namespace PropertyHub.Application.DTOs;

// ==================== CUSTOMER PORTAL DTOs ====================

public class CustomerRegistrationDto
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(200)]
    public string FullName { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Phone is required")]
    [StringLength(50)]
    public string Phone { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Nationality { get; set; }
    
    [StringLength(200)]
    public string? Company { get; set; }
    
    public string? CustomerRequirements { get; set; }
    
    // Preferences during registration
    public List<string>? PropertyTypes { get; set; }
    public List<string>? Locations { get; set; }
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public Timeline Timeline { get; set; } = Timeline.Flexible;
}

public class CustomerLoginDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}

public class CustomerProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Nationality { get; set; }
    public string? Company { get; set; }
    public string? CustomerRequirements { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public DateTime? ConversionDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Statistics
    public int TotalReservations { get; set; }
    public int ActiveReservations { get; set; }
    public int TotalBookings { get; set; }
    public int UnreadMessages { get; set; }
    public int SavedProperties { get; set; }
}

public class UpdateCustomerProfileDto
{
    [Required]
    [StringLength(200)]
    public string FullName { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Phone { get; set; }
    
    [StringLength(100)]
    public string? Nationality { get; set; }
    
    [StringLength(200)]
    public string? Company { get; set; }
    
    public string? CustomerRequirements { get; set; }
}

public class CustomerDashboardDto
{
    public CustomerProfileDto Profile { get; set; } = null!;
    public CustomerPreferencesDto Preferences { get; set; } = null!;
    public List<PropertyRecommendationDto> RecommendedProperties { get; set; } = new();
    public List<CustomerBookingDto> RecentBookings { get; set; } = new();
    public List<CustomerMessageDto> RecentMessages { get; set; } = new();
    public CustomerStatisticsDto Statistics { get; set; } = null!;
}

public class CustomerStatisticsDto
{
    public int TotalReservations { get; set; }
    public int ActiveReservations { get; set; }
    public int CompletedReservations { get; set; }
    public int TotalBookings { get; set; }
    public int TotalMessages { get; set; }
    public int UnreadMessages { get; set; }
    public int SavedProperties { get; set; }
    public int PropertyViews { get; set; }
    public decimal TotalInvestment { get; set; }
}

public class CustomerPreferencesDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public List<string> PropertyTypes { get; set; } = new();
    public List<string> Locations { get; set; } = new();
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public List<string> Amenities { get; set; } = new();
    public Timeline Timeline { get; set; }
}

public class UpdateCustomerPreferencesDto
{
    public List<string>? PropertyTypes { get; set; }
    public List<string>? Locations { get; set; }
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public List<string>? Amenities { get; set; }
    public Timeline Timeline { get; set; } = Timeline.Flexible;
}

public class PropertyRecommendationDto
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public string PropertyTitle { get; set; } = string.Empty;
    public string Project { get; set; } = string.Empty;
    public PropertyType PropertyType { get; set; }
    public PropertyStatus PropertyStatus { get; set; }
    public decimal Price { get; set; }
    public Currency Currency { get; set; }
    public decimal Size { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> Images { get; set; } = new();
    public List<string> Amenities { get; set; } = new();
    public int ConfidenceScore { get; set; }
    public List<string> MatchReasons { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public DateTime RecommendedDate { get; set; }
}

public class CustomerBookingDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid PropertyId { get; set; }
    public string PropertyTitle { get; set; } = string.Empty;
    public string PropertyLocation { get; set; } = string.Empty;
    public DateTime BookingDate { get; set; }
    public DateTime VisitDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public BookingType BookingType { get; set; }
    public decimal? TotalAmount { get; set; }
    public List<string> PropertyImages { get; set; } = new();
}

public class CreateCustomerBookingDto
{
    [Required]
    public Guid PropertyId { get; set; }
    
    [Required]
    public DateTime VisitDate { get; set; }
    
    [Required]
    public BookingType BookingType { get; set; }
    
    public string? SpecialRequirements { get; set; }
}

public class CustomerMessageDto
{
    public Guid Id { get; set; }
    public Guid FromUserId { get; set; }
    public string FromUserName { get; set; } = string.Empty;
    public Guid ToUserId { get; set; }
    public string ToUserName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public MessageType MessageType { get; set; }
    public Priority Priority { get; set; }
    public bool Read { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SendCustomerMessageDto
{
    [Required]
    public Guid ToUserId { get; set; }
    
    [Required]
    [StringLength(300)]
    public string Subject { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public MessageType MessageType { get; set; } = MessageType.General;
    public Priority Priority { get; set; } = Priority.Medium;
}

public class CustomerReservationDto
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public string PropertyTitle { get; set; } = string.Empty;
    public string PropertyLocation { get; set; } = string.Empty;
    public ReservationStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal DepositPercentage { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? ReservationNumber { get; set; }
    public DateTime? HoldEndDate { get; set; }
    public int HoldDurationDays { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ConfirmedDate { get; set; }
    public DateTime? CancelledDate { get; set; }
    public List<string> PropertyImages { get; set; } = new();
}

public class CustomerNotificationDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool Read { get; set; }
}

public class SavedPropertyDto
{
    public Guid PropertyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Project { get; set; } = string.Empty;
    public PropertyType Type { get; set; }
    public PropertyStatus Status { get; set; }
    public decimal Price { get; set; }
    public Currency Currency { get; set; }
    public string Location { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public DateTime SavedDate { get; set; }
}
