using PropertyHub.Core.Entities;
using PropertyHub.Core.Enums;
using PropertyHub.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace PropertyHub.Application.Services;

/// <summary>
/// CRM Management Service - Lead management, scoring, pipeline operations, and activity tracking
/// </summary>
public class CRMManagementService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly CRMService _crmService;
    private readonly PropertyService _propertyService;
    private readonly ILogger<CRMManagementService> _logger;

    public CRMManagementService(
        IUnitOfWork unitOfWork,
        CRMService crmService,
        PropertyService propertyService,
        ILogger<CRMManagementService> logger)
    {
        _unitOfWork = unitOfWork;
        _crmService = crmService;
        _propertyService = propertyService;
        _logger = logger;
    }

    /// <summary>
    /// Get leads with advanced filtering and sorting
    /// </summary>
    public async Task<LeadQueryResult> GetLeadsWithFiltersAsync(LeadFilterOptions filters)
    {
        try
        {
            var query = await _unitOfWork.Repository<Lead>().GetAllAsync();

            // Apply filters
            if (!string.IsNullOrEmpty(filters.Status))
            {
                if (Enum.TryParse<LeadStatus>(filters.Status, true, out var status))
                {
                    query = query.Where(l => l.Status == status);
                }
            }

            if (!string.IsNullOrEmpty(filters.BuyerType))
            {
                if (Enum.TryParse<BuyerType>(filters.BuyerType, true, out var buyerType))
                {
                    query = query.Where(l => l.BuyerType == buyerType);
                }
            }

            if (filters.MinScore.HasValue)
            {
                query = query.Where(l => l.Score >= filters.MinScore.Value);
            }

            if (filters.MaxScore.HasValue)
            {
                query = query.Where(l => l.Score <= filters.MaxScore.Value);
            }

            if (filters.MinBudget.HasValue)
            {
                query = query.Where(l => l.BudgetMax >= filters.MinBudget.Value);
            }

            if (filters.MaxBudget.HasValue)
            {
                query = query.Where(l => l.BudgetMin <= filters.MaxBudget.Value);
            }

            if (!string.IsNullOrEmpty(filters.Source))
            {
                query = query.Where(l => l.Source != null && l.Source.ToLower().Contains(filters.Source.ToLower()));
            }

            if (!string.IsNullOrEmpty(filters.Country))
            {
                query = query.Where(l => l.Country != null && l.Country.ToLower().Contains(filters.Country.ToLower()));
            }

            // Search term
            if (!string.IsNullOrEmpty(filters.SearchTerm))
            {
                var searchLower = filters.SearchTerm.ToLower();
                query = query.Where(l =>
                    l.FirstName.ToLower().Contains(searchLower) ||
                    l.LastName.ToLower().Contains(searchLower) ||
                    l.Email.ToLower().Contains(searchLower) ||
                    (l.Phone != null && l.Phone.Contains(filters.SearchTerm))
                );
            }

            // Apply sorting
            query = filters.SortBy?.ToLower() switch
            {
                "score_desc" => query.OrderByDescending(l => l.Score),
                "score_asc" => query.OrderBy(l => l.Score),
                "budget_desc" => query.OrderByDescending(l => l.BudgetMax),
                "budget_asc" => query.OrderBy(l => l.BudgetMin),
                "name_asc" => query.OrderBy(l => l.FirstName).ThenBy(l => l.LastName),
                "name_desc" => query.OrderByDescending(l => l.FirstName).ThenByDescending(l => l.LastName),
                _ => query.OrderByDescending(l => l.CreatedAt)
            };

            var total = query.Count();
            
            // Pagination
            var leads = query
                .Skip(filters.Offset ?? 0)
                .Take(filters.Limit ?? 50)
                .Select(l => new LeadDto
                {
                    Id = l.Id,
                    FirstName = l.FirstName,
                    LastName = l.LastName,
                    Email = l.Email,
                    Phone = l.Phone,
                    BuyerType = l.BuyerType.ToString(),
                    BudgetMin = l.BudgetMin,
                    BudgetMax = l.BudgetMax,
                    Currency = l.Currency.ToString(),
                    Timeline = l.Timeline.ToString(),
                    Status = l.Status.ToString(),
                    Score = l.Score,
                    Source = l.Source,
                    Country = l.Country,
                    CreatedAt = l.CreatedAt
                })
                .ToList();

            return new LeadQueryResult
            {
                Total = total,
                Leads = leads,
                Page = (filters.Offset ?? 0) / (filters.Limit ?? 50) + 1,
                PageSize = filters.Limit ?? 50
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leads with filters");
            throw;
        }
    }

    /// <summary>
    /// Get lead by ID with full details
    /// </summary>
    public async Task<LeadDetailDto?> GetLeadDetailsAsync(Guid leadId)
    {
        try
        {
            var lead = await _unitOfWork.Repository<Lead>().GetByIdAsync(leadId);
            
            if (lead == null) return null;

            // Get property recommendations for this lead
            var propertyRecommendations = await GetPropertyRecommendationsAsync(lead);

            return new LeadDetailDto
            {
                Id = lead.Id,
                FirstName = lead.FirstName,
                LastName = lead.LastName,
                Email = lead.Email,
                Phone = lead.Phone,
                BuyerType = lead.BuyerType.ToString(),
                BudgetMin = lead.BudgetMin,
                BudgetMax = lead.BudgetMax,
                Currency = lead.Currency.ToString(),
                Timeline = lead.Timeline.ToString(),
                Status = lead.Status.ToString(),
                Score = lead.Score,
                Source = lead.Source,
                Country = lead.Country,
                Notes = lead.Notes,
                PropertyRecommendations = propertyRecommendations,
                CreatedAt = lead.CreatedAt,
                UpdatedAt = lead.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lead details for ID: {LeadId}", leadId);
            throw;
        }
    }

    /// <summary>
    /// Create new lead with automatic scoring
    /// </summary>
    public async Task<Guid> CreateLeadAsync(CreateLeadRequest request)
    {
        try
        {
            var timeline = Enum.Parse<Timeline>(request.Timeline);
            var buyerType = Enum.Parse<BuyerType>(request.BuyerType);
            
            // Calculate lead score automatically
            var score = _crmService.CalculateLeadScore(request.BudgetMax, timeline, buyerType);

            var lead = new Lead
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                BuyerType = buyerType,
                BudgetMin = request.BudgetMin,
                BudgetMax = request.BudgetMax,
                Currency = Enum.Parse<Currency>(request.Currency),
                Timeline = timeline,
                Status = LeadStatus.New,
                Score = score,
                Source = request.Source,
                Country = request.Country,
                Notes = request.Notes
            };

            await _unitOfWork.Repository<Lead>().AddAsync(lead);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Lead created: {LeadId} with score {Score}", lead.Id, score);
            return lead.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating lead");
            throw;
        }
    }

    /// <summary>
    /// Update lead information
    /// </summary>
    public async Task<bool> UpdateLeadAsync(Guid leadId, UpdateLeadRequest request)
    {
        try
        {
            var lead = await _unitOfWork.Repository<Lead>().GetByIdAsync(leadId);
            
            if (lead == null) return false;

            // Update fields
            lead.FirstName = request.FirstName ?? lead.FirstName;
            lead.LastName = request.LastName ?? lead.LastName;
            lead.Email = request.Email ?? lead.Email;
            lead.Phone = request.Phone ?? lead.Phone;
            lead.BudgetMin = request.BudgetMin ?? lead.BudgetMin;
            lead.BudgetMax = request.BudgetMax ?? lead.BudgetMax;
            lead.Source = request.Source ?? lead.Source;
            lead.Country = request.Country ?? lead.Country;
            lead.Notes = request.Notes ?? lead.Notes;

            if (request.BuyerType != null && Enum.TryParse<BuyerType>(request.BuyerType, out var buyerType))
            {
                lead.BuyerType = buyerType;
            }

            if (request.Timeline != null && Enum.TryParse<Timeline>(request.Timeline, out var timeline))
            {
                lead.Timeline = timeline;
            }

            if (request.Status != null && Enum.TryParse<LeadStatus>(request.Status, out var status))
            {
                lead.Status = status;
            }

            // Recalculate score if relevant fields changed
            if (request.BudgetMax.HasValue || request.Timeline != null || request.BuyerType != null)
            {
                lead.Score = _crmService.CalculateLeadScore(lead.BudgetMax, lead.Timeline, lead.BuyerType);
            }

            await _unitOfWork.Repository<Lead>().UpdateAsync(lead);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lead {LeadId}", leadId);
            throw;
        }
    }

    /// <summary>
    /// Update lead status (for pipeline management)
    /// </summary>
    public async Task<bool> UpdateLeadStatusAsync(Guid leadId, LeadStatus newStatus)
    {
        try
        {
            var lead = await _unitOfWork.Repository<Lead>().GetByIdAsync(leadId);
            
            if (lead == null) return false;

            lead.Status = newStatus;
            
            // If converting to customer, set conversion date
            if (newStatus == LeadStatus.Converted)
            {
                _logger.LogInformation("Lead {LeadId} converted to customer", leadId);
            }

            await _unitOfWork.Repository<Lead>().UpdateAsync(lead);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lead status for {LeadId}", leadId);
            throw;
        }
    }

    /// <summary>
    /// Delete lead
    /// </summary>
    public async Task<bool> DeleteLeadAsync(Guid leadId)
    {
        try
        {
            var lead = await _unitOfWork.Repository<Lead>().GetByIdAsync(leadId);
            
            if (lead == null) return false;

            // Mark as Lost instead of deleting
            lead.Status = LeadStatus.Lost;
            await _unitOfWork.Repository<Lead>().UpdateAsync(lead);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting lead {LeadId}", leadId);
            throw;
        }
    }

    /// <summary>
    /// Get pipeline statistics
    /// </summary>
    public async Task<PipelineStatsDto> GetPipelineStatsAsync()
    {
        try
        {
            var allLeads = await _unitOfWork.Repository<Lead>().GetAllAsync();

            var stats = new PipelineStatsDto
            {
                NewLeads = allLeads.Count(l => l.Status == LeadStatus.New),
                ContactedLeads = allLeads.Count(l => l.Status == LeadStatus.Contacted),
                QualifiedLeads = allLeads.Count(l => l.Status == LeadStatus.Qualified),
                ViewingLeads = allLeads.Count(l => l.Status == LeadStatus.Viewing),
                NegotiatingLeads = allLeads.Count(l => l.Status == LeadStatus.Negotiating),
                ConvertedLeads = allLeads.Count(l => l.Status == LeadStatus.Converted),
                LostLeads = allLeads.Count(l => l.Status == LeadStatus.Lost),
                TotalLeads = allLeads.Count(),
                AverageScore = allLeads.Any() ? (int)allLeads.Average(l => l.Score) : 0,
                ConversionRate = allLeads.Any() ? 
                    (decimal)allLeads.Count(l => l.Status == LeadStatus.Converted) / allLeads.Count() * 100 : 0
            };

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pipeline statistics");
            throw;
        }
    }

    /// <summary>
    /// Get leads by status (for pipeline view)
    /// </summary>
    public async Task<List<LeadDto>> GetLeadsByStatusAsync(LeadStatus status)
    {
        try
        {
            var leads = await _unitOfWork.Repository<Lead>().FindAsync(l => l.Status == status);

            return leads.Select(l => new LeadDto
            {
                Id = l.Id,
                FirstName = l.FirstName,
                LastName = l.LastName,
                Email = l.Email,
                Phone = l.Phone,
                BuyerType = l.BuyerType.ToString(),
                BudgetMin = l.BudgetMin,
                BudgetMax = l.BudgetMax,
                Currency = l.Currency.ToString(),
                Timeline = l.Timeline.ToString(),
                Status = l.Status.ToString(),
                Score = l.Score,
                Source = l.Source,
                Country = l.Country,
                CreatedAt = l.CreatedAt
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leads by status {Status}", status);
            throw;
        }
    }

    /// <summary>
    /// Get top leads by score
    /// </summary>
    public async Task<List<LeadDto>> GetTopLeadsAsync(int count = 10)
    {
        try
        {
            var leads = await _unitOfWork.Repository<Lead>().GetAllAsync();

            return leads
                .Where(l => l.Status != LeadStatus.Converted && l.Status != LeadStatus.Lost)
                .OrderByDescending(l => l.Score)
                .Take(count)
                .Select(l => new LeadDto
                {
                    Id = l.Id,
                    FirstName = l.FirstName,
                    LastName = l.LastName,
                    Email = l.Email,
                    Phone = l.Phone,
                    BuyerType = l.BuyerType.ToString(),
                    BudgetMin = l.BudgetMin,
                    BudgetMax = l.BudgetMax,
                    Currency = l.Currency.ToString(),
                    Timeline = l.Timeline.ToString(),
                    Status = l.Status.ToString(),
                    Score = l.Score,
                    Source = l.Source,
                    Country = l.Country,
                    CreatedAt = l.CreatedAt
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top leads");
            throw;
        }
    }

    /// <summary>
    /// Get property recommendations for a lead based on budget and preferences
    /// </summary>
    private async Task<List<PropertyRecommendationDto>> GetPropertyRecommendationsAsync(Lead lead)
    {
        try
        {
            var properties = await _unitOfWork.Repository<Property>().GetAllAsync();

            // Filter properties that match lead's budget
            var matchingProperties = properties
                .Where(p => 
                    p.Status == PropertyStatus.Available &&
                    p.Price >= (lead.BudgetMin ?? 0) * 0.8m && // 20% flexibility
                    p.Price <= (lead.BudgetMax ?? decimal.MaxValue) * 1.2m)
                .OrderByDescending(p => 
                    _propertyService.CalculateInterestScore(p.Views, p.Inquiries, p.Tours, p.Offers))
                .Take(5)
                .Select(p => new PropertyRecommendationDto
                {
                    PropertyId = p.Id,
                    PropertyTitle = p.Title,
                    PropertyPrice = p.Price,
                    PropertyCurrency = p.Currency.ToString(),
                    PropertyLocation = p.Location,
                    PropertyType = p.Type.ToString(),
                    MatchScore = CalculatePropertyMatchScore(lead, p),
                    MatchReason = GenerateMatchReason(lead, p)
                })
                .ToList();

            return matchingProperties;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating property recommendations for lead {LeadId}", lead.Id);
            return new List<PropertyRecommendationDto>();
        }
    }

    /// <summary>
    /// Calculate how well a property matches a lead
    /// </summary>
    private int CalculatePropertyMatchScore(Lead lead, Property property)
    {
        int score = 0;

        // Budget match (0-40 points)
        if (property.Price >= (lead.BudgetMin ?? 0) && property.Price <= (lead.BudgetMax ?? decimal.MaxValue))
        {
            score += 40;
        }
        else if (property.Price <= (lead.BudgetMax ?? decimal.MaxValue) * 1.1m)
        {
            score += 30;
        }
        else if (property.Price <= (lead.BudgetMax ?? decimal.MaxValue) * 1.2m)
        {
            score += 20;
        }

        // Property performance (0-30 points)
        var interestScore = _propertyService.CalculateInterestScore(
            property.Views, property.Inquiries, property.Tours, property.Offers);
        score += (int)Math.Min(30, interestScore / 10);

        // Buyer type match (0-30 points)
        if (lead.BuyerType == BuyerType.HNI && property.Price > 500000)
        {
            score += 30;
        }
        else if (lead.BuyerType == BuyerType.Investor && property.Type == PropertyType.Investment)
        {
            score += 30;
        }
        else if (lead.BuyerType == BuyerType.Commercial && property.Type == PropertyType.Commercial)
        {
            score += 30;
        }
        else
        {
            score += 15;
        }

        return Math.Min(100, score);
    }

    /// <summary>
    /// Generate human-readable match reason
    /// </summary>
    private string GenerateMatchReason(Lead lead, Property property)
    {
        var reasons = new List<string>();

        if (property.Price >= (lead.BudgetMin ?? 0) && property.Price <= (lead.BudgetMax ?? decimal.MaxValue))
        {
            reasons.Add("Within budget range");
        }

        if (lead.BuyerType == BuyerType.HNI && property.Price > 500000)
        {
            reasons.Add("Premium property for HNI buyer");
        }

        if (lead.BuyerType == BuyerType.Investor && property.Type == PropertyType.Investment)
        {
            reasons.Add("Investment opportunity");
        }

        if (property.Offers > 5)
        {
            reasons.Add("High demand property");
        }

        return reasons.Any() ? string.Join(", ", reasons) : "Recommended based on your preferences";
    }

    /// <summary>
    /// Get lead statistics by buyer type
    /// </summary>
    public async Task<List<BuyerTypeStatsDto>> GetLeadsByBuyerTypeAsync()
    {
        try
        {
            var leads = await _unitOfWork.Repository<Lead>().GetAllAsync();

            return leads
                .GroupBy(l => l.BuyerType)
                .Select(g => new BuyerTypeStatsDto
                {
                    BuyerType = g.Key.ToString(),
                    Count = g.Count(),
                    AverageScore = (int)g.Average(l => l.Score),
                    ConvertedCount = g.Count(l => l.Status == LeadStatus.Converted),
                    ConversionRate = g.Any() ? 
                        (decimal)g.Count(l => l.Status == LeadStatus.Converted) / g.Count() * 100 : 0
                })
                .OrderByDescending(s => s.Count)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leads by buyer type");
            throw;
        }
    }
}

// DTOs
public class LeadFilterOptions
{
    public string? Status { get; set; }
    public string? BuyerType { get; set; }
    public int? MinScore { get; set; }
    public int? MaxScore { get; set; }
    public decimal? MinBudget { get; set; }
    public decimal? MaxBudget { get; set; }
    public string? Source { get; set; }
    public string? Country { get; set; }
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public int? Limit { get; set; } = 50;
    public int? Offset { get; set; } = 0;
}

public class LeadQueryResult
{
    public int Total { get; set; }
    public List<LeadDto> Leads { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class LeadDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string BuyerType { get; set; } = string.Empty;
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Timeline { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Score { get; set; }
    public string? Source { get; set; }
    public string? Country { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LeadDetailDto : LeadDto
{
    public string? Notes { get; set; }
    public List<PropertyRecommendationDto> PropertyRecommendations { get; set; } = new();
    public DateTime? UpdatedAt { get; set; }
}

public class PropertyRecommendationDto
{
    public Guid PropertyId { get; set; }
    public string PropertyTitle { get; set; } = string.Empty;
    public decimal PropertyPrice { get; set; }
    public string PropertyCurrency { get; set; } = string.Empty;
    public string PropertyLocation { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty;
    public int MatchScore { get; set; }
    public string MatchReason { get; set; } = string.Empty;
}

public class CreateLeadRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string BuyerType { get; set; } = string.Empty;
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public string Currency { get; set; } = "USD";
    public string Timeline { get; set; } = string.Empty;
    public string? Source { get; set; }
    public string? Country { get; set; }
    public string? Notes { get; set; }
}

public class UpdateLeadRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? BuyerType { get; set; }
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public string? Timeline { get; set; }
    public string? Status { get; set; }
    public string? Source { get; set; }
    public string? Country { get; set; }
    public string? Notes { get; set; }
}

public class PipelineStatsDto
{
    public int NewLeads { get; set; }
    public int ContactedLeads { get; set; }
    public int QualifiedLeads { get; set; }
    public int ViewingLeads { get; set; }
    public int NegotiatingLeads { get; set; }
    public int ConvertedLeads { get; set; }
    public int LostLeads { get; set; }
    public int TotalLeads { get; set; }
    public int AverageScore { get; set; }
    public decimal ConversionRate { get; set; }
}

public class BuyerTypeStatsDto
{
    public string BuyerType { get; set; } = string.Empty;
    public int Count { get; set; }
    public int AverageScore { get; set; }
    public int ConvertedCount { get; set; }
    public decimal ConversionRate { get; set; }
}
