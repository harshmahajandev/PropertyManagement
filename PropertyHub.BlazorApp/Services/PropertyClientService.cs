using PropertyHub.Application.Services;
using System.Net.Http.Json;
using System.Text.Json;

namespace PropertyHub.BlazorApp.Services;

/// <summary>
/// Client service for Property Management API calls
/// </summary>
public class PropertyClientService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PropertyClientService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public PropertyClientService(HttpClient httpClient, ILogger<PropertyClientService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    /// <summary>
    /// Get properties with filters
    /// </summary>
    public async Task<PropertyQueryResult?> GetPropertiesAsync(PropertyFilterOptions filters)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("api/properties/list", filters);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<PropertyQueryResult>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching properties");
            return null;
        }
    }

    /// <summary>
    /// Get property details by ID
    /// </summary>
    public async Task<PropertyDetailDto?> GetPropertyByIdAsync(Guid id, bool incrementView = true)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/properties/{id}?incrementView={incrementView}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<PropertyDetailDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching property details for ID: {PropertyId}", id);
            return null;
        }
    }

    /// <summary>
    /// Create new property
    /// </summary>
    public async Task<CreatePropertyResponse?> CreatePropertyAsync(CreatePropertyDto property)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("api/properties", property);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<CreatePropertyResponse>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating property");
            return null;
        }
    }

    /// <summary>
    /// Update existing property
    /// </summary>
    public async Task<bool> UpdatePropertyAsync(Guid id, UpdatePropertyRequest request)
    {
        try
        {
            var response = await _httpClient.PutAsJsonAsync($"api/properties/{id}", request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating property {PropertyId}", id);
            return false;
        }
    }

    /// <summary>
    /// Delete property
    /// </summary>
    public async Task<bool> DeletePropertyAsync(Guid id)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"api/properties/{id}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting property {PropertyId}", id);
            return false;
        }
    }

    /// <summary>
    /// Search properties
    /// </summary>
    public async Task<PropertyQueryResult?> SearchPropertiesAsync(string searchTerm, int limit = 20, int offset = 0)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/properties/search?searchTerm={Uri.EscapeDataString(searchTerm)}&limit={limit}&offset={offset}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<PropertyQueryResult>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching properties");
            return null;
        }
    }

    /// <summary>
    /// Get top performing properties
    /// </summary>
    public async Task<List<PropertyDto>?> GetTopPerformersAsync(int count = 10)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/properties/top-performers?count={count}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<PropertyDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching top performers");
            return null;
        }
    }

    /// <summary>
    /// Get project statistics
    /// </summary>
    public async Task<List<ProjectStatsDto>?> GetProjectStatsAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("api/properties/project-stats");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<ProjectStatsDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching project statistics");
            return null;
        }
    }

    /// <summary>
    /// Record property inquiry
    /// </summary>
    public async Task<bool> RecordInquiryAsync(Guid propertyId)
    {
        try
        {
            var response = await _httpClient.PostAsync($"api/properties/{propertyId}/inquiry", null);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording inquiry");
            return false;
        }
    }

    /// <summary>
    /// Record property tour
    /// </summary>
    public async Task<bool> RecordTourAsync(Guid propertyId)
    {
        try
        {
            var response = await _httpClient.PostAsync($"api/properties/{propertyId}/tour", null);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording tour");
            return false;
        }
    }

    /// <summary>
    /// Record property offer
    /// </summary>
    public async Task<bool> RecordOfferAsync(Guid propertyId)
    {
        try
        {
            var response = await _httpClient.PostAsync($"api/properties/{propertyId}/offer", null);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording offer");
            return false;
        }
    }
}

// Client-side DTOs
public class CreatePropertyDto
{
    public string Title { get; set; } = string.Empty;
    public string Project { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal Size { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Images { get; set; }
    public string? Amenities { get; set; }
    public string? Features { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class CreatePropertyResponse
{
    public bool Success { get; set; }
    public Guid PropertyId { get; set; }
    public string Message { get; set; } = string.Empty;
}
