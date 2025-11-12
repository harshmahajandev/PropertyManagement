using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PropertyHub.Application.DTOs;
using PropertyHub.Core.Interfaces;
using PropertyHub.Core.Entities;
using PropertyHub.Core.Enums;

namespace PropertyHub.Application.Services;

public class CustomerPortalService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRepository<Customer> _customerRepository;
    private readonly IRepository<CustomerPreferences> _preferencesRepository;
    private readonly IRepository<PropertyRecommendation> _recommendationRepository;
    private readonly IRepository<Booking> _bookingRepository;
    private readonly IRepository<Message> _messageRepository;
    private readonly IRepository<Reservation> _reservationRepository;
    private readonly IRepository<Property> _propertyRepository;

    public CustomerPortalService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
        _customerRepository = unitOfWork.Repository<Customer>();
        _preferencesRepository = unitOfWork.Repository<CustomerPreferences>();
        _recommendationRepository = unitOfWork.Repository<PropertyRecommendation>();
        _bookingRepository = unitOfWork.Repository<Booking>();
        _messageRepository = unitOfWork.Repository<Message>();
        _reservationRepository = unitOfWork.Repository<Reservation>();
        _propertyRepository = unitOfWork.Repository<Property>();
    }

    // ==================== REGISTRATION & AUTHENTICATION ====================

    public async Task<CustomerProfileDto> RegisterCustomerAsync(CustomerRegistrationDto dto)
    {
        // Check if customer already exists
        var existingCustomer = await _customerRepository
            .GetQueryable()
            .FirstOrDefaultAsync(c => c.Email == dto.Email);

        if (existingCustomer != null)
        {
            throw new InvalidOperationException("A customer with this email already exists");
        }

        // Create customer
        var customer = new Customer
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            Nationality = dto.Nationality,
            Company = dto.Company,
            CustomerRequirements = dto.CustomerRequirements,
            RiskLevel = RiskLevel.Low,
            CreatedAt = DateTime.UtcNow
        };

        await _customerRepository.AddAsync(customer);

        // Create preferences if provided
        if (dto.PropertyTypes?.Any() == true || dto.BudgetMin.HasValue)
        {
            var preferences = new CustomerPreferences
            {
                CustomerId = customer.Id,
                PropertyTypes = dto.PropertyTypes != null ? JsonSerializer.Serialize(dto.PropertyTypes) : null,
                Locations = dto.Locations != null ? JsonSerializer.Serialize(dto.Locations) : null,
                BudgetMin = dto.BudgetMin,
                BudgetMax = dto.BudgetMax,
                Bedrooms = dto.Bedrooms,
                Bathrooms = dto.Bathrooms,
                Timeline = dto.Timeline,
                CreatedAt = DateTime.UtcNow
            };

            await _preferencesRepository.AddAsync(preferences);
        }

        await _unitOfWork.SaveChangesAsync();

        return await GetCustomerProfileAsync(customer.Id);
    }

    public async Task<CustomerProfileDto> LoginCustomerAsync(CustomerLoginDto dto)
    {
        var customer = await _customerRepository
            .GetQueryable()
            .FirstOrDefaultAsync(c => c.Email == dto.Email);

        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found");
        }

        return await GetCustomerProfileAsync(customer.Id);
    }

    // ==================== PROFILE MANAGEMENT ====================

    public async Task<CustomerProfileDto> GetCustomerProfileAsync(Guid customerId)
    {
        var customer = await _customerRepository.GetByIdAsync(customerId);
        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found");
        }

        // Get statistics
        var reservations = await _reservationRepository
            .GetQueryable()
            .Where(r => r.CustomerId == customerId)
            .ToListAsync();

        var bookings = await _bookingRepository
            .GetQueryable()
            .Where(b => b.CustomerId == customerId)
            .ToListAsync();

        var unreadMessages = await _messageRepository
            .GetQueryable()
            .CountAsync(m => m.ToUserId == customerId && !m.Read);

        var recommendations = await _recommendationRepository
            .GetQueryable()
            .CountAsync(r => r.CustomerId == customerId && r.Status == "Active");

        return new CustomerProfileDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Email = customer.Email,
            Phone = customer.Phone,
            Nationality = customer.Nationality,
            Company = customer.Company,
            CustomerRequirements = customer.CustomerRequirements,
            RiskLevel = customer.RiskLevel,
            ConversionDate = customer.ConversionDate,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt,
            TotalReservations = reservations.Count,
            ActiveReservations = reservations.Count(r => 
                r.Status == ReservationStatus.Confirmed || 
                r.Status == ReservationStatus.Pending),
            TotalBookings = bookings.Count,
            UnreadMessages = unreadMessages,
            SavedProperties = recommendations
        };
    }

    public async Task<CustomerProfileDto> UpdateCustomerProfileAsync(Guid customerId, UpdateCustomerProfileDto dto)
    {
        var customer = await _customerRepository.GetByIdAsync(customerId);
        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found");
        }

        customer.FullName = dto.FullName;
        customer.Phone = dto.Phone;
        customer.Nationality = dto.Nationality;
        customer.Company = dto.Company;
        customer.CustomerRequirements = dto.CustomerRequirements;
        customer.UpdatedAt = DateTime.UtcNow;

        await _customerRepository.UpdateAsync(customer);
        await _unitOfWork.SaveChangesAsync();

        return await GetCustomerProfileAsync(customerId);
    }

    // ==================== DASHBOARD ====================

    public async Task<CustomerDashboardDto> GetCustomerDashboardAsync(Guid customerId)
    {
        var profile = await GetCustomerProfileAsync(customerId);
        var preferences = await GetCustomerPreferencesAsync(customerId);
        var recommendations = await GetPropertyRecommendationsAsync(customerId, 6);
        var recentBookings = await GetCustomerBookingsAsync(customerId, 5);
        var recentMessages = await GetCustomerMessagesAsync(customerId, 5);
        var statistics = await GetCustomerStatisticsAsync(customerId);

        return new CustomerDashboardDto
        {
            Profile = profile,
            Preferences = preferences,
            RecommendedProperties = recommendations,
            RecentBookings = recentBookings,
            RecentMessages = recentMessages,
            Statistics = statistics
        };
    }

    public async Task<CustomerStatisticsDto> GetCustomerStatisticsAsync(Guid customerId)
    {
        var reservations = await _reservationRepository
            .GetQueryable()
            .Where(r => r.CustomerId == customerId)
            .ToListAsync();

        var bookings = await _bookingRepository
            .GetQueryable()
            .Where(b => b.CustomerId == customerId)
            .CountAsync();

        var messages = await _messageRepository
            .GetQueryable()
            .Where(m => m.ToUserId == customerId)
            .ToListAsync();

        var recommendations = await _recommendationRepository
            .GetQueryable()
            .CountAsync(r => r.CustomerId == customerId && r.Status == "Active");

        var totalInvestment = reservations
            .Where(r => r.Status == ReservationStatus.Confirmed)
            .Sum(r => r.TotalAmount);

        return new CustomerStatisticsDto
        {
            TotalReservations = reservations.Count,
            ActiveReservations = reservations.Count(r => 
                r.Status == ReservationStatus.Confirmed || 
                r.Status == ReservationStatus.Pending),
            CompletedReservations = reservations.Count(r => 
                r.Status == ReservationStatus.Completed),
            TotalBookings = bookings,
            TotalMessages = messages.Count,
            UnreadMessages = messages.Count(m => !m.Read),
            SavedProperties = recommendations,
            PropertyViews = 0, // Can be tracked separately
            TotalInvestment = totalInvestment
        };
    }

    // ==================== PREFERENCES MANAGEMENT ====================

    public async Task<CustomerPreferencesDto> GetCustomerPreferencesAsync(Guid customerId)
    {
        var preferences = await _preferencesRepository
            .GetQueryable()
            .FirstOrDefaultAsync(p => p.CustomerId == customerId);

        if (preferences == null)
        {
            // Return default preferences
            return new CustomerPreferencesDto
            {
                Id = Guid.Empty,
                CustomerId = customerId,
                PropertyTypes = new List<string>(),
                Locations = new List<string>(),
                Amenities = new List<string>(),
                Timeline = Timeline.Flexible
            };
        }

        return new CustomerPreferencesDto
        {
            Id = preferences.Id,
            CustomerId = preferences.CustomerId,
            PropertyTypes = !string.IsNullOrEmpty(preferences.PropertyTypes) 
                ? JsonSerializer.Deserialize<List<string>>(preferences.PropertyTypes) ?? new List<string>()
                : new List<string>(),
            Locations = !string.IsNullOrEmpty(preferences.Locations)
                ? JsonSerializer.Deserialize<List<string>>(preferences.Locations) ?? new List<string>()
                : new List<string>(),
            BudgetMin = preferences.BudgetMin,
            BudgetMax = preferences.BudgetMax,
            Bedrooms = preferences.Bedrooms,
            Bathrooms = preferences.Bathrooms,
            Amenities = !string.IsNullOrEmpty(preferences.Amenities)
                ? JsonSerializer.Deserialize<List<string>>(preferences.Amenities) ?? new List<string>()
                : new List<string>(),
            Timeline = preferences.Timeline
        };
    }

    public async Task<CustomerPreferencesDto> UpdateCustomerPreferencesAsync(
        Guid customerId, 
        UpdateCustomerPreferencesDto dto)
    {
        var preferences = await _preferencesRepository
            .GetQueryable()
            .FirstOrDefaultAsync(p => p.CustomerId == customerId);

        if (preferences == null)
        {
            // Create new preferences
            preferences = new CustomerPreferences
            {
                CustomerId = customerId,
                CreatedAt = DateTime.UtcNow
            };
            await _preferencesRepository.AddAsync(preferences);
        }

        preferences.PropertyTypes = dto.PropertyTypes != null && dto.PropertyTypes.Any()
            ? JsonSerializer.Serialize(dto.PropertyTypes)
            : null;
        preferences.Locations = dto.Locations != null && dto.Locations.Any()
            ? JsonSerializer.Serialize(dto.Locations)
            : null;
        preferences.BudgetMin = dto.BudgetMin;
        preferences.BudgetMax = dto.BudgetMax;
        preferences.Bedrooms = dto.Bedrooms;
        preferences.Bathrooms = dto.Bathrooms;
        preferences.Amenities = dto.Amenities != null && dto.Amenities.Any()
            ? JsonSerializer.Serialize(dto.Amenities)
            : null;
        preferences.Timeline = dto.Timeline;
        preferences.UpdatedAt = DateTime.UtcNow;

        if (preferences.Id != Guid.Empty)
        {
            await _preferencesRepository.UpdateAsync(preferences);
        }

        await _unitOfWork.SaveChangesAsync();

        // Generate new recommendations based on updated preferences
        await GeneratePropertyRecommendationsAsync(customerId);

        return await GetCustomerPreferencesAsync(customerId);
    }

    // ==================== PROPERTY RECOMMENDATIONS ====================

    public async Task<List<PropertyRecommendationDto>> GetPropertyRecommendationsAsync(
        Guid customerId, 
        int take = 10)
    {
        var recommendations = await _recommendationRepository
            .GetQueryable()
            .Include(r => r.Property)
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.ConfidenceScore)
            .Take(take)
            .ToListAsync();

        return recommendations.Select(r => new PropertyRecommendationDto
        {
            Id = r.Id,
            PropertyId = r.PropertyId,
            PropertyTitle = r.Property.Title,
            Project = r.Property.Project,
            PropertyType = r.Property.Type,
            PropertyStatus = r.Property.Status,
            Price = r.Property.Price,
            Currency = r.Property.Currency,
            Size = r.Property.Size,
            Bedrooms = r.Property.Bedrooms,
            Bathrooms = r.Property.Bathrooms,
            Location = r.Property.Location,
            Description = r.Property.Description,
            Images = !string.IsNullOrEmpty(r.Property.Images)
                ? JsonSerializer.Deserialize<List<string>>(r.Property.Images) ?? new List<string>()
                : new List<string>(),
            Amenities = !string.IsNullOrEmpty(r.Property.Amenities)
                ? JsonSerializer.Deserialize<List<string>>(r.Property.Amenities) ?? new List<string>()
                : new List<string>(),
            ConfidenceScore = r.ConfidenceScore,
            MatchReasons = !string.IsNullOrEmpty(r.MatchReasons)
                ? JsonSerializer.Deserialize<List<string>>(r.MatchReasons) ?? new List<string>()
                : new List<string>(),
            Status = r.Status ?? "Active",
            RecommendedDate = r.CreatedAt
        }).ToList();
    }

    public async Task GeneratePropertyRecommendationsAsync(Guid customerId)
    {
        var preferences = await _preferencesRepository
            .GetQueryable()
            .FirstOrDefaultAsync(p => p.CustomerId == customerId);

        if (preferences == null)
        {
            return;
        }

        // Get all available properties
        var properties = await _propertyRepository
            .GetQueryable()
            .Where(p => p.Status == PropertyStatus.Available)
            .ToListAsync();

        // Clear existing recommendations
        var existingRecommendations = await _recommendationRepository
            .GetQueryable()
            .Where(r => r.CustomerId == customerId)
            .ToListAsync();

        foreach (var recommendation in existingRecommendations)
        {
            await _recommendationRepository.DeleteAsync(recommendation);
        }

        // Generate new recommendations
        foreach (var property in properties)
        {
            var (confidenceScore, matchReasons) = CalculatePropertyMatch(property, preferences);

            if (confidenceScore >= 50) // Only recommend if confidence >= 50%
            {
                var recommendation = new PropertyRecommendation
                {
                    CustomerId = customerId,
                    PropertyId = property.Id,
                    ConfidenceScore = confidenceScore,
                    MatchReasons = JsonSerializer.Serialize(matchReasons),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                await _recommendationRepository.AddAsync(recommendation);
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    private (int confidenceScore, List<string> matchReasons) CalculatePropertyMatch(
        Property property,
        CustomerPreferences preferences)
    {
        int score = 0;
        var reasons = new List<string>();

        // Property Type Match (25 points)
        if (!string.IsNullOrEmpty(preferences.PropertyTypes))
        {
            var preferredTypes = JsonSerializer.Deserialize<List<string>>(preferences.PropertyTypes);
            if (preferredTypes?.Contains(property.Type.ToString()) == true)
            {
                score += 25;
                reasons.Add($"Matches your preferred type: {property.Type}");
            }
        }

        // Budget Match (25 points)
        if (preferences.BudgetMin.HasValue && preferences.BudgetMax.HasValue)
        {
            if (property.Price >= preferences.BudgetMin.Value && 
                property.Price <= preferences.BudgetMax.Value)
            {
                score += 25;
                reasons.Add($"Within your budget range");
            }
        }

        // Location Match (20 points)
        if (!string.IsNullOrEmpty(preferences.Locations))
        {
            var preferredLocations = JsonSerializer.Deserialize<List<string>>(preferences.Locations);
            if (preferredLocations?.Any(loc => property.Location.Contains(loc, StringComparison.OrdinalIgnoreCase)) == true)
            {
                score += 20;
                reasons.Add($"In your preferred location");
            }
        }

        // Bedrooms Match (15 points)
        if (preferences.Bedrooms.HasValue && property.Bedrooms >= preferences.Bedrooms.Value)
        {
            score += 15;
            reasons.Add($"Has {property.Bedrooms} bedrooms (you prefer {preferences.Bedrooms})");
        }

        // Bathrooms Match (10 points)
        if (preferences.Bathrooms.HasValue && property.Bathrooms >= preferences.Bathrooms.Value)
        {
            score += 10;
            reasons.Add($"Has {property.Bathrooms} bathrooms");
        }

        // Amenities Match (5 points)
        if (!string.IsNullOrEmpty(preferences.Amenities) && !string.IsNullOrEmpty(property.Amenities))
        {
            var preferredAmenities = JsonSerializer.Deserialize<List<string>>(preferences.Amenities);
            var propertyAmenities = JsonSerializer.Deserialize<List<string>>(property.Amenities);
            
            var matchingAmenities = preferredAmenities?.Intersect(propertyAmenities ?? new List<string>()).ToList();
            if (matchingAmenities?.Any() == true)
            {
                score += 5;
                reasons.Add($"Has preferred amenities: {string.Join(", ", matchingAmenities.Take(3))}");
            }
        }

        return (score, reasons);
    }

    // ==================== BOOKINGS ====================

    public async Task<List<CustomerBookingDto>> GetCustomerBookingsAsync(Guid customerId, int? take = null)
    {
        var query = _bookingRepository
            .GetQueryable()
            .Include(b => b.Customer)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.BookingDate);

        var bookings = take.HasValue 
            ? await query.Take(take.Value).ToListAsync()
            : await query.ToListAsync();

        var bookingDtos = new List<CustomerBookingDto>();

        foreach (var booking in bookings)
        {
            var property = await _propertyRepository.GetByIdAsync(booking.PropertyId);
            if (property != null)
            {
                bookingDtos.Add(new CustomerBookingDto
                {
                    Id = booking.Id,
                    CustomerId = booking.CustomerId,
                    PropertyId = booking.PropertyId,
                    PropertyTitle = property.Title,
                    PropertyLocation = property.Location,
                    BookingDate = booking.BookingDate,
                    VisitDate = booking.VisitDate,
                    Status = booking.Status ?? "Pending",
                    BookingType = booking.BookingType,
                    TotalAmount = booking.TotalAmount,
                    PropertyImages = !string.IsNullOrEmpty(property.Images)
                        ? JsonSerializer.Deserialize<List<string>>(property.Images) ?? new List<string>()
                        : new List<string>()
                });
            }
        }

        return bookingDtos;
    }

    public async Task<CustomerBookingDto> CreateCustomerBookingAsync(
        Guid customerId, 
        CreateCustomerBookingDto dto)
    {
        var customer = await _customerRepository.GetByIdAsync(customerId);
        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found");
        }

        var property = await _propertyRepository.GetByIdAsync(dto.PropertyId);
        if (property == null)
        {
            throw new InvalidOperationException("Property not found");
        }

        var booking = new Booking
        {
            CustomerId = customerId,
            PropertyId = dto.PropertyId,
            BookingDate = DateTime.UtcNow,
            VisitDate = dto.VisitDate,
            Status = "Confirmed",
            BookingType = dto.BookingType,
            CreatedAt = DateTime.UtcNow
        };

        await _bookingRepository.AddAsync(booking);
        await _unitOfWork.SaveChangesAsync();

        var bookings = await GetCustomerBookingsAsync(customerId);
        return bookings.First(b => b.Id == booking.Id);
    }

    // ==================== MESSAGES ====================

    public async Task<List<CustomerMessageDto>> GetCustomerMessagesAsync(Guid customerId, int? take = null)
    {
        var query = _messageRepository
            .GetQueryable()
            .Where(m => m.ToUserId == customerId || m.FromUserId == customerId)
            .OrderByDescending(m => m.CreatedAt);

        var messages = take.HasValue
            ? await query.Take(take.Value).ToListAsync()
            : await query.ToListAsync();

        var messageDtos = new List<CustomerMessageDto>();

        foreach (var message in messages)
        {
            var fromUser = await _customerRepository.GetByIdAsync(message.FromUserId);
            var toUser = await _customerRepository.GetByIdAsync(message.ToUserId);

            messageDtos.Add(new CustomerMessageDto
            {
                Id = message.Id,
                FromUserId = message.FromUserId,
                FromUserName = fromUser?.FullName ?? "System",
                ToUserId = message.ToUserId,
                ToUserName = toUser?.FullName ?? "Unknown",
                Subject = message.Subject,
                Content = message.Content,
                MessageType = message.MessageType,
                Priority = message.Priority,
                Read = message.Read,
                CreatedAt = message.CreatedAt
            });
        }

        return messageDtos;
    }

    public async Task<CustomerMessageDto> SendCustomerMessageAsync(
        Guid fromCustomerId, 
        SendCustomerMessageDto dto)
    {
        var fromCustomer = await _customerRepository.GetByIdAsync(fromCustomerId);
        if (fromCustomer == null)
        {
            throw new InvalidOperationException("Sender not found");
        }

        var toCustomer = await _customerRepository.GetByIdAsync(dto.ToUserId);
        if (toCustomer == null)
        {
            throw new InvalidOperationException("Recipient not found");
        }

        var message = new Message
        {
            FromUserId = fromCustomerId,
            ToUserId = dto.ToUserId,
            Subject = dto.Subject,
            Content = dto.Content,
            MessageType = dto.MessageType,
            Priority = dto.Priority,
            Read = false,
            CreatedAt = DateTime.UtcNow
        };

        await _messageRepository.AddAsync(message);
        await _unitOfWork.SaveChangesAsync();

        return new CustomerMessageDto
        {
            Id = message.Id,
            FromUserId = message.FromUserId,
            FromUserName = fromCustomer.FullName,
            ToUserId = message.ToUserId,
            ToUserName = toCustomer.FullName,
            Subject = message.Subject,
            Content = message.Content,
            MessageType = message.MessageType,
            Priority = message.Priority,
            Read = message.Read,
            CreatedAt = message.CreatedAt
        };
    }

    public async Task MarkMessageAsReadAsync(Guid messageId, Guid customerId)
    {
        var message = await _messageRepository.GetByIdAsync(messageId);
        if (message == null)
        {
            throw new InvalidOperationException("Message not found");
        }

        if (message.ToUserId != customerId)
        {
            throw new UnauthorizedAccessException("You can only mark your own messages as read");
        }

        message.Read = true;
        await _messageRepository.UpdateAsync(message);
        await _unitOfWork.SaveChangesAsync();
    }

    // ==================== RESERVATIONS ====================

    public async Task<List<CustomerReservationDto>> GetCustomerReservationsAsync(Guid customerId)
    {
        var reservations = await _reservationRepository
            .GetQueryable()
            .Include(r => r.Property)
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reservations.Select(r => new CustomerReservationDto
        {
            Id = r.Id,
            PropertyId = r.PropertyId,
            PropertyTitle = r.Property.Title,
            PropertyLocation = r.Property.Location,
            Status = r.Status,
            TotalAmount = r.TotalAmount,
            DepositAmount = r.DepositAmount,
            DepositPercentage = r.DepositPercentage,
            PaymentStatus = r.PaymentStatus,
            ReservationNumber = r.ReservationNumber,
            HoldEndDate = r.HoldEndDate,
            HoldDurationDays = r.HoldDurationDays,
            CreatedAt = r.CreatedAt,
            ConfirmedDate = r.ConfirmedDate,
            CancelledDate = r.CancelledDate,
            PropertyImages = !string.IsNullOrEmpty(r.Property.Images)
                ? JsonSerializer.Deserialize<List<string>>(r.Property.Images) ?? new List<string>()
                : new List<string>()
        }).ToList();
    }
}
