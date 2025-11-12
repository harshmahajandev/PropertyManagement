using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyHub.Application.Services;

namespace PropertyHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            DashboardService dashboardService,
            ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        /// <summary>
        /// Get complete dashboard summary with all KPIs
        /// </summary>
        /// <param name="currency">Optional currency code (default: USD)</param>
        /// <returns>Dashboard summary with statistics</returns>
        [HttpGet("summary")]
        [ProducesResponseType(typeof(DashboardSummaryDto), 200)]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary([FromQuery] string? currency = "USD")
        {
            try
            {
                var summary = await _dashboardService.GetDashboardSummaryAsync(currency);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard summary");
                return StatusCode(500, new { error = "An error occurred while retrieving dashboard data" });
            }
        }

        /// <summary>
        /// Get property statistics
        /// </summary>
        [HttpGet("properties/stats")]
        [ProducesResponseType(typeof(PropertyStatsDto), 200)]
        public async Task<ActionResult<PropertyStatsDto>> GetPropertyStats()
        {
            try
            {
                var summary = await _dashboardService.GetDashboardSummaryAsync();
                return Ok(summary.PropertyStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving property statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving property statistics" });
            }
        }

        /// <summary>
        /// Get lead statistics
        /// </summary>
        [HttpGet("leads/stats")]
        [ProducesResponseType(typeof(LeadStatsDto), 200)]
        public async Task<ActionResult<LeadStatsDto>> GetLeadStats()
        {
            try
            {
                var summary = await _dashboardService.GetDashboardSummaryAsync();
                return Ok(summary.LeadStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving lead statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving lead statistics" });
            }
        }

        /// <summary>
        /// Get reservation statistics
        /// </summary>
        [HttpGet("reservations/stats")]
        [ProducesResponseType(typeof(ReservationStatsDto), 200)]
        public async Task<ActionResult<ReservationStatsDto>> GetReservationStats()
        {
            try
            {
                var summary = await _dashboardService.GetDashboardSummaryAsync();
                return Ok(summary.ReservationStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reservation statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving reservation statistics" });
            }
        }

        /// <summary>
        /// Get financial statistics
        /// </summary>
        /// <param name="currency">Currency code (default: USD)</param>
        [HttpGet("financial/stats")]
        [ProducesResponseType(typeof(FinancialStatsDto), 200)]
        public async Task<ActionResult<FinancialStatsDto>> GetFinancialStats([FromQuery] string? currency = "USD")
        {
            try
            {
                var summary = await _dashboardService.GetDashboardSummaryAsync(currency);
                return Ok(summary.FinancialStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving financial statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving financial statistics" });
            }
        }

        /// <summary>
        /// Get recent activities across the platform
        /// </summary>
        [HttpGet("activities/recent")]
        [ProducesResponseType(typeof(List<ActivityDto>), 200)]
        public async Task<ActionResult<List<ActivityDto>>> GetRecentActivities()
        {
            try
            {
                var summary = await _dashboardService.GetDashboardSummaryAsync();
                return Ok(summary.RecentActivities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent activities");
                return StatusCode(500, new { error = "An error occurred while retrieving recent activities" });
            }
        }

        /// <summary>
        /// Get top performing properties
        /// </summary>
        [HttpGet("properties/top")]
        [ProducesResponseType(typeof(List<TopPropertyDto>), 200)]
        public async Task<ActionResult<List<TopPropertyDto>>> GetTopProperties()
        {
            try
            {
                var summary = await _dashboardService.GetDashboardSummaryAsync();
                return Ok(summary.TopProperties);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top properties");
                return StatusCode(500, new { error = "An error occurred while retrieving top properties" });
            }
        }

        /// <summary>
        /// Get leads distribution by segment
        /// </summary>
        [HttpGet("leads/by-segment")]
        [ProducesResponseType(typeof(Dictionary<string, int>), 200)]
        public async Task<ActionResult<Dictionary<string, int>>> GetLeadsBySegment()
        {
            try
            {
                var summary = await _dashboardService.GetDashboardSummaryAsync();
                return Ok(summary.LeadsBySegment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving leads by segment");
                return StatusCode(500, new { error = "An error occurred while retrieving leads by segment" });
            }
        }

        /// <summary>
        /// Get reservations distribution by status
        /// </summary>
        [HttpGet("reservations/by-status")]
        [ProducesResponseType(typeof(Dictionary<string, int>), 200)]
        public async Task<ActionResult<Dictionary<string, int>>> GetReservationsByStatus()
        {
            try
            {
                var summary = await _dashboardService.GetDashboardSummaryAsync();
                return Ok(summary.ReservationsByStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reservations by status");
                return StatusCode(500, new { error = "An error occurred while retrieving reservations by status" });
            }
        }
    }
}
