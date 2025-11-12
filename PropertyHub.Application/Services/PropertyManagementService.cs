using PropertyHub.Core.Entities;
using PropertyHub.Core.Enums;
using PropertyHub.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace PropertyHub.Application.Services;

/// <summary>
/// Property Management Service - Advanced property operations, analytics, and lead matching
/// </summary>
public class PropertyManagementService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly PropertyService _propertyService;
    private readonly CRMService _crmService;
    private readonly CurrencyService _currencyService;
    private readonly ILogger<PropertyManagementService> _logger;

    public PropertyManagementService(
        IUnitOfWork unitOfWork,
        PropertyService propertyService,
        CRMService crmService,
        CurrencyService currencyService,
        ILogger<PropertyManagementService> logger)
    {
        _unitOfWork = unitOfWork;
        _propertyService = propertyService;
        _crmService = crmService;
        _currencyService = currencyService;
        _logger = logger;
    }

    /// <summary>
    /// Get properties with advanced filtering and sorting
    /// </summary>
    public async Task<PropertyQueryResult> GetPropertiesWithFiltersAsync(PropertyFilterOptions filters)
    {
        try
        {
            var query = await _unitOfWork.Repository<Property>().GetAllAsync();

            // Apply filters
            if (!string.IsNullOrEmpty(filters.Status))
            {
                if (Enum.TryParse<PropertyStatus>(filters.Status, true, out var status))
                {
                    query = query.Where(p => p.Status == status);
                }
            }

            if (!string.IsNullOrEmpty(filters.Type))
            {
                if (Enum.TryParse<PropertyType>(filters.Type, true, out var type))
                {
                    query = query.Where(p => p.Type == type);
                }
            }

            if (!string.IsNullOrEmpty(filters.Project))
            {
                query = query.Where(p => p.Project.ToLower().Contains(filters.Project.ToLower()));
            }

            if (!string.IsNullOrEmpty(filters.Location))
            {
                query = query.Where(p => p.Location.ToLower().Contains(filters.Location.ToLower()));
            }

            if (filters.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filters.MinPrice.Value);
            }

            if (filters.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filters.MaxPrice.Value);
            }

            if (filters.MinSize.HasValue)
            {
                query = query.Where(p => p.Size >= filters.MinSize.Value);
            }

            if (filters.MaxSize.HasValue)
            {
                query = query.Where(p => p.Size <= filters.MaxSize.Value);
            }

            if (filters.Bedrooms.HasValue)
            {
                query = query.Where(p => p.Bedrooms >= filters.Bedrooms.Value);
            }

            if (filters.Bathrooms.HasValue)
            {
                query = query.Where(p => p.Bathrooms >= filters.Bathrooms.Value);
            }

            // Search term
            if (!string.IsNullOrEmpty(filters.SearchTerm))
            {
                var searchLower = filters.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.Title.ToLower().Contains(searchLower) ||
                    p.Project.ToLower().Contains(searchLower) ||
                    p.Location.ToLower().Contains(searchLower) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchLower))
                );
            }

            // Apply sorting
            query = filters.SortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "size_asc" => query.OrderBy(p => p.Size),
                "size_desc" => query.OrderByDescending(p => p.Size),
                "views_desc" => query.OrderByDescending(p => p.Views),
                "interest_desc" => query.OrderByDescending(p => 
                    (p.Views * 0.1m) + (p.Inquiries * 2) + (p.Tours * 5) + (p.Offers * 10)),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            var total = query.Count();
            
            // Pagination
            var properties = query
                .Skip(filters.Offset ?? 0)
                .Take(filters.Limit ?? 50)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Project = p.Project,
                    Type = p.Type.ToString(),
                    Status = p.Status.ToString(),
                    Price = p.Price,
                    Currency = p.Currency.ToString(),
                    Size = p.Size,
                    Bedrooms = p.Bedrooms,
                    Bathrooms = p.Bathrooms,
                    Location = p.Location,
                    Description = p.Description,
                    Images = p.Images,
                    Amenities = p.Amenities,
                    Views = p.Views,
                    Inquiries = p.Inquiries,
                    Tours = p.Tours,
                    Offers = p.Offers,
                    InterestScore = _propertyService.CalculateInterestScore(p.Views, p.Inquiries, p.Tours, p.Offers),
                    ConversionRate = _propertyService.CalculateConversionRate(p.Offers, p.Inquiries),
                    CreatedAt = p.CreatedAt
                })
                .ToList();

            return new PropertyQueryResult
            {
                Total = total,
                Properties = properties,
                Page = (filters.Offset ?? 0) / (filters.Limit ?? 50) + 1,
                PageSize = filters.Limit ?? 50
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving properties with filters");
            throw;
        }
    }

    /// <summary>
    /// Get property by ID with full details
    /// </summary>
    public async Task<PropertyDetailDto?> GetPropertyDetailsAsync(Guid propertyId, bool incrementView = true)
    {
        try
        {
            var property = await _unitOfWork.Repository<Property>().GetByIdAsync(propertyId);
            
            if (property == null) return null;

            // Increment views if requested
            if (incrementView)
            {
                property.Views++;
                await _unitOfWork.Repository<Property>().UpdateAsync(property);
                await _unitOfWork.SaveChangesAsync();
            }

            // Get lead matching data
            var leadMatches = await GetLeadMatchesForPropertyAsync(property);

            return new PropertyDetailDto
            {
                Id = property.Id,
                Title = property.Title,
                Project = property.Project,
                Type = property.Type.ToString(),
                Status = property.Status.ToString(),
                Price = property.Price,
                Currency = property.Currency.ToString(),
                Size = property.Size,
                Bedrooms = property.Bedrooms,
                Bathrooms = property.Bathrooms,
                Location = property.Location,
                Description = property.Description,
                Images = property.Images,
                Amenities = property.Amenities,
                Features = property.Features,
                Latitude = property.Latitude,
                Longitude = property.Longitude,
                Performance = new PropertyPerformanceDto
                {
                    Views = property.Views,
                    Inquiries = property.Inquiries,
                    Tours = property.Tours,
                    Offers = property.Offers,
                    InterestScore = _propertyService.CalculateInterestScore(property.Views, property.Inquiries, property.Tours, property.Offers),
                    ConversionRate = _propertyService.CalculateConversionRate(property.Offers, property.Inquiries)
                },
                LeadMatches = leadMatches,
                CreatedAt = property.CreatedAt,
                UpdatedAt = property.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving property details for ID: {PropertyId}", propertyId);
            throw;
        }
    }

    /// <summary>
    /// Get lead matches for a specific property
    /// </summary>
    private async Task<LeadMatchDto> GetLeadMatchesForPropertyAsync(Property property)
    {
        try
        {
            var allLeads = await _unitOfWork.Repository<Lead>().GetAllAsync();
            
            // Filter leads that match property criteria (budget, preferences)
            var matchingLeads = allLeads.Where(l =>
                l.BudgetMax >= property.Price * 0.8m && // 20% flexibility
                l.BudgetMin <= property.Price * 1.2m &&
                (l.Status == LeadStatus.New || l.Status == LeadStatus.Contacted || 
                 l.Status == LeadStatus.Qualified || l.Status == LeadStatus.Viewing)
            ).ToList();

            var hniLeads = matchingLeads.Count(l => l.BuyerType == BuyerType.HNI);
            var investorLeads = matchingLeads.Count(l => l.BuyerType == BuyerType.Investor);
            var retailLeads = matchingLeads.Count(l => l.BuyerType == BuyerType.Retail);

            var matchScore = _propertyService.CalculateLeadMatchScore(hniLeads, investorLeads, retailLeads);

            return new LeadMatchDto
            {
                TotalMatches = matchingLeads.Count,
                HNILeads = hniLeads,
                InvestorLeads = investorLeads,
                RetailLeads = retailLeads,
                MatchScore = matchScore
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating lead matches for property {PropertyId}", property.Id);
            return new LeadMatchDto(); // Return empty if error
        }
    }

    /// <summary>
    /// Update property details
    /// </summary>
    public async Task<bool> UpdatePropertyAsync(Guid propertyId, UpdatePropertyRequest request)
    {
        try
        {
            var property = await _unitOfWork.Repository<Property>().GetByIdAsync(propertyId);
            
            if (property == null) return false;

            // Update fields
            property.Title = request.Title ?? property.Title;
            property.Description = request.Description ?? property.Description;
            property.Price = request.Price ?? property.Price;
            property.Size = request.Size ?? property.Size;
            property.Bedrooms = request.Bedrooms ?? property.Bedrooms;
            property.Bathrooms = request.Bathrooms ?? property.Bathrooms;
            property.Location = request.Location ?? property.Location;
            property.Images = request.Images ?? property.Images;
            property.Amenities = request.Amenities ?? property.Amenities;
            property.Features = request.Features ?? property.Features;

            if (request.Status != null && Enum.TryParse<PropertyStatus>(request.Status, out var status))
            {
                property.Status = status;
            }

            if (request.Type != null && Enum.TryParse<PropertyType>(request.Type, out var type))
            {
                property.Type = type;
            }

            await _unitOfWork.Repository<Property>().UpdateAsync(property);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating property {PropertyId}", propertyId);
            throw;
        }
    }

    /// <summary>
    /// Delete property (soft delete by changing status)
    /// </summary>
    public async Task<bool> DeletePropertyAsync(Guid propertyId)
    {
        try
        {
            var property = await _unitOfWork.Repository<Property>().GetByIdAsync(propertyId);
            
            if (property == null) return false;

            // Soft delete: change status to Archived
            property.Status = PropertyStatus.Maintenance; // Using Maintenance as archived
            await _unitOfWork.Repository<Property>().UpdateAsync(property);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting property {PropertyId}", propertyId);
            throw;
        }
    }

    /// <summary>
    /// Get top performing properties
    /// </summary>
    public async Task<List<PropertyDto>> GetTopPerformingPropertiesAsync(int count = 10)
    {
        try
        {
            var properties = await _unitOfWork.Repository<Property>().GetAllAsync();

            return properties
                .Where(p => p.Status == PropertyStatus.Available)
                .OrderByDescending(p => 
                    _propertyService.CalculateInterestScore(p.Views, p.Inquiries, p.Tours, p.Offers))
                .Take(count)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Project = p.Project,
                    Type = p.Type.ToString(),
                    Status = p.Status.ToString(),
                    Price = p.Price,
                    Currency = p.Currency.ToString(),
                    Size = p.Size,
                    Bedrooms = p.Bedrooms,
                    Bathrooms = p.Bathrooms,
                    Location = p.Location,
                    Views = p.Views,
                    Inquiries = p.Inquiries,
                    Tours = p.Tours,
                    Offers = p.Offers,
                    InterestScore = _propertyService.CalculateInterestScore(p.Views, p.Inquiries, p.Tours, p.Offers),
                    ConversionRate = _propertyService.CalculateConversionRate(p.Offers, p.Inquiries)
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top performing properties");
            throw;
        }
    }

    /// <summary>
    /// Get property statistics by project
    /// </summary>
    public async Task<List<ProjectStatsDto>> GetProjectStatisticsAsync()
    {
        try
        {
            var properties = await _unitOfWork.Repository<Property>().GetAllAsync();

            return properties
                .GroupBy(p => p.Project)
                .Select(g => new ProjectStatsDto
                {
                    ProjectName = g.Key,
                    TotalProperties = g.Count(),
                    AvailableProperties = g.Count(p => p.Status == PropertyStatus.Available),
                    ReservedProperties = g.Count(p => p.Status == PropertyStatus.Reserved),
                    SoldProperties = g.Count(p => p.Status == PropertyStatus.Sold),
                    AveragePrice = g.Average(p => p.Price),
                    TotalViews = g.Sum(p => p.Views),
                    TotalInquiries = g.Sum(p => p.Inquiries)
                })
                .OrderByDescending(s => s.TotalProperties)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving project statistics");
            throw;
        }
    }
}

// DTOs
public class PropertyFilterOptions
{
    public string? Status { get; set; }
    public string? Type { get; set; }
    public string? Project { get; set; }
    public string? Location { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public decimal? MinSize { get; set; }
    public decimal? MaxSize { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public int? Limit { get; set; } = 50;
    public int? Offset { get; set; } = 0;
}

public class PropertyQueryResult
{
    public int Total { get; set; }
    public List<PropertyDto> Properties { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class PropertyDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Project { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal Size { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Images { get; set; }
    public string? Amenities { get; set; }
    public int Views { get; set; }
    public int Inquiries { get; set; }
    public int Tours { get; set; }
    public int Offers { get; set; }
    public decimal InterestScore { get; set; }
    public decimal ConversionRate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PropertyDetailDto : PropertyDto
{
    public string? Features { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public PropertyPerformanceDto Performance { get; set; } = new();
    public LeadMatchDto LeadMatches { get; set; } = new();
    public DateTime? UpdatedAt { get; set; }
}

public class PropertyPerformanceDto
{
    public int Views { get; set; }
    public int Inquiries { get; set; }
    public int Tours { get; set; }
    public int Offers { get; set; }
    public decimal InterestScore { get; set; }
    public decimal ConversionRate { get; set; }
}

public class LeadMatchDto
{
    public int TotalMatches { get; set; }
    public int HNILeads { get; set; }
    public int InvestorLeads { get; set; }
    public int RetailLeads { get; set; }
    public int MatchScore { get; set; }
}

public class UpdatePropertyRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public decimal? Size { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public string? Location { get; set; }
    public string? Images { get; set; }
    public string? Amenities { get; set; }
    public string? Features { get; set; }
    public string? Status { get; set; }
    public string? Type { get; set; }
}

public class ProjectStatsDto
{
    public string ProjectName { get; set; } = string.Empty;
    public int TotalProperties { get; set; }
    public int AvailableProperties { get; set; }
    public int ReservedProperties { get; set; }
    public int SoldProperties { get; set; }
    public decimal AveragePrice { get; set; }
    public int TotalViews { get; set; }
    public int TotalInquiries { get; set; }
}
