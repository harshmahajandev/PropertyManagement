using PropertyHub.Application.Services;
using System.Net.Http.Json;
using System.Text.Json;

namespace PropertyHub.BlazorApp.Services;

/// <summary>
/// Client service for CRM API calls
/// </summary>
public class CRMClientService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CRMClientService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public CRMClientService(HttpClient httpClient, ILogger<CRMClientService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    /// <summary>
    /// Get leads with filters
    /// </summary>
    public async Task<LeadQueryResult?> GetLeadsAsync(LeadFilterOptions filters)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("api/crm/leads/list", filters);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<LeadQueryResult>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching leads");
            return null;
        }
    }

    /// <summary>
    /// Get lead details by ID
    /// </summary>
    public async Task<LeadDetailDto?> GetLeadByIdAsync(Guid id)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/crm/leads/{id}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<LeadDetailDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching lead details for ID: {LeadId}", id);
            return null;
        }
    }

    /// <summary>
    /// Create new lead
    /// </summary>
    public async Task<CreateLeadResponse?> CreateLeadAsync(CreateLeadRequest lead)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("api/crm/leads", lead);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<CreateLeadResponse>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating lead");
            return null;
        }
    }

    /// <summary>
    /// Update existing lead
    /// </summary>
    public async Task<bool> UpdateLeadAsync(Guid id, UpdateLeadRequest request)
    {
        try
        {
            var response = await _httpClient.PutAsJsonAsync($"api/crm/leads/{id}", request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lead {LeadId}", id);
            return false;
        }
    }

    /// <summary>
    /// Delete lead
    /// </summary>
    public async Task<bool> DeleteLeadAsync(Guid id)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"api/crm/leads/{id}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting lead {LeadId}", id);
            return false;
        }
    }

    /// <summary>
    /// Update lead status
    /// </summary>
    public async Task<bool> UpdateLeadStatusAsync(Guid id, string status)
    {
        try
        {
            var request = new { Status = status };
            var response = await _httpClient.PatchAsJsonAsync($"api/crm/leads/{id}/status", request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lead status {LeadId}", id);
            return false;
        }
    }

    /// <summary>
    /// Get pipeline statistics
    /// </summary>
    public async Task<PipelineStatsDto?> GetPipelineStatsAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("api/crm/pipeline/stats");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<PipelineStatsDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching pipeline statistics");
            return null;
        }
    }

    /// <summary>
    /// Get leads by status
    /// </summary>
    public async Task<List<LeadDto>?> GetLeadsByStatusAsync(string status)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/crm/pipeline/{status}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<LeadDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching leads by status");
            return null;
        }
    }

    /// <summary>
    /// Get top leads by score
    /// </summary>
    public async Task<List<LeadDto>?> GetTopLeadsAsync(int count = 10)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/crm/leads/top?count={count}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<LeadDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching top leads");
            return null;
        }
    }

    /// <summary>
    /// Get leads by buyer type statistics
    /// </summary>
    public async Task<List<BuyerTypeStatsDto>?> GetLeadsByBuyerTypeAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("api/crm/leads/buyer-types");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<BuyerTypeStatsDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching leads by buyer type");
            return null;
        }
    }

    /// <summary>
    /// Search leads
    /// </summary>
    public async Task<LeadQueryResult?> SearchLeadsAsync(string searchTerm, int limit = 20, int offset = 0)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/crm/leads/search?searchTerm={Uri.EscapeDataString(searchTerm)}&limit={limit}&offset={offset}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<LeadQueryResult>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching leads");
            return null;
        }
    }

    /// <summary>
    /// Get conversion statistics
    /// </summary>
    public async Task<ConversionStatsDto?> GetConversionStatsAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("api/crm/stats/conversion");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<ConversionStatsDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching conversion statistics");
            return null;
        }
    }

    /// <summary>
    /// Convert lead to customer
    /// </summary>
    public async Task<ConvertLeadResponse?> ConvertLeadAsync(Guid id, ConvertLeadClientRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync($"api/crm/leads/{id}/convert", request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<ConvertLeadResponse>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting lead");
            return null;
        }
    }
}

// Client-side DTOs
public class CreateLeadResponse
{
    public bool Success { get; set; }
    public Guid LeadId { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class ConversionStatsDto
{
    public int TotalLeads { get; set; }
    public int ConvertedLeads { get; set; }
    public int LostLeads { get; set; }
    public int ActiveLeads { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal LossRate { get; set; }
}

public class ConvertLeadClientRequest
{
    public string? Company { get; set; }
    public string? Requirements { get; set; }
    public string? RiskLevel { get; set; }
}

public class ConvertLeadResponse
{
    public bool Success { get; set; }
    public Guid CustomerId { get; set; }
    public string Message { get; set; } = string.Empty;
}
