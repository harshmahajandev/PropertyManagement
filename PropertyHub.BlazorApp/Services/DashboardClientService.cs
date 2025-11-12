using System.Net.Http.Json;
using PropertyHub.Application.Services;
using PropertyHub.Application.DTOs;

namespace PropertyHub.BlazorApp.Services
{
    public class DashboardClientService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<DashboardClientService> _logger;

        public DashboardClientService(IHttpClientFactory httpClientFactory, ILogger<DashboardClientService> logger)
        {
            _httpClient = httpClientFactory.CreateClient("PropertyHubAPI");
            _logger = logger;
        }

        public async Task<DashboardSummaryDto?> GetDashboardSummaryAsync(string currency = "USD")
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<DashboardSummaryDto>($"dashboard/summary?currency={currency}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard summary");
                return null;
            }
        }

        public async Task<PropertyStatsDto?> GetPropertyStatsAsync()
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<PropertyStatsDto>("dashboard/properties/stats");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching property stats");
                return null;
            }
        }

        public async Task<LeadStatsDto?> GetLeadStatsAsync()
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<LeadStatsDto>("dashboard/leads/stats");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching lead stats");
                return null;
            }
        }

        public async Task<ReservationStatsDto?> GetReservationStatsAsync()
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<ReservationStatsDto>("dashboard/reservations/stats");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching reservation stats");
                return null;
            }
        }

        public async Task<FinancialStatsDto?> GetFinancialStatsAsync(string currency = "USD")
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<FinancialStatsDto>($"dashboard/financial/stats?currency={currency}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching financial stats");
                return null;
            }
        }

        public async Task<List<ActivityDto>?> GetRecentActivitiesAsync()
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<List<ActivityDto>>("dashboard/activities/recent");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching recent activities");
                return null;
            }
        }

        public async Task<List<TopPropertyDto>?> GetTopPropertiesAsync()
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<List<TopPropertyDto>>("dashboard/properties/top");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching top properties");
                return null;
            }
        }

        public async Task<Dictionary<string, int>?> GetLeadsBySegmentAsync()
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<Dictionary<string, int>>("dashboard/leads/by-segment");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching leads by segment");
                return null;
            }
        }

        public async Task<Dictionary<string, int>?> GetReservationsByStatusAsync()
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<Dictionary<string, int>>("dashboard/reservations/by-status");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching reservations by status");
                return null;
            }
        }
    }
}
