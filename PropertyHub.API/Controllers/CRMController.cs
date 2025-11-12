using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyHub.Core.Entities;
using PropertyHub.Core.Enums;
using PropertyHub.Core.Interfaces;
using PropertyHub.Application.Services;

namespace PropertyHub.API.Controllers;

[ApiController]
[Route("api/crm")]
//[Authorize] // Temporarily disabled for development
public class CRMController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly CRMService _crmService;
    private readonly CRMManagementService _crmManagementService;
    private readonly ILogger<CRMController> _logger;

    public CRMController(
        IUnitOfWork unitOfWork,
        CRMService crmService,
        CRMManagementService crmManagementService,
        ILogger<CRMController> logger)
    {
        _unitOfWork = unitOfWork;
        _crmService = crmService;
        _crmManagementService = crmManagementService;
        _logger = logger;
    }

    /// <summary>
    /// Get all leads with advanced filtering
    /// </summary>
    [HttpPost("leads/list")]
    public async Task<IActionResult> GetLeads([FromBody] LeadFilterOptions filters)
    {
        try
        {
            var result = await _crmManagementService.GetLeadsWithFiltersAsync(filters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leads");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get lead details by ID
    /// </summary>
    [HttpGet("leads/{id}")]
    public async Task<IActionResult> GetLeadById(Guid id)
    {
        try
        {
            var lead = await _crmManagementService.GetLeadDetailsAsync(id);
            
            if (lead == null)
            {
                return NotFound(new { error = "Lead not found" });
            }

            return Ok(lead);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lead details");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Create new lead
    /// </summary>
    [HttpPost("leads")]
    public async Task<IActionResult> CreateLead([FromBody] CreateLeadRequest request)
    {
        try
        {
            var leadId = await _crmManagementService.CreateLeadAsync(request);

            return CreatedAtAction(nameof(GetLeadById), new { id = leadId }, 
                new { success = true, leadId, message = "Lead created successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating lead");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Update existing lead
    /// </summary>
    [HttpPut("leads/{id}")]
    public async Task<IActionResult> UpdateLead(Guid id, [FromBody] UpdateLeadRequest request)
    {
        try
        {
            var success = await _crmManagementService.UpdateLeadAsync(id, request);
            
            if (!success)
            {
                return NotFound(new { error = "Lead not found" });
            }

            return Ok(new { success = true, message = "Lead updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lead");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Delete lead (mark as lost)
    /// </summary>
    [HttpDelete("leads/{id}")]
    public async Task<IActionResult> DeleteLead(Guid id)
    {
        try
        {
            var success = await _crmManagementService.DeleteLeadAsync(id);
            
            if (!success)
            {
                return NotFound(new { error = "Lead not found" });
            }

            return Ok(new { success = true, message = "Lead deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting lead");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Update lead status (for pipeline management)
    /// </summary>
    [HttpPatch("leads/{id}/status")]
    public async Task<IActionResult> UpdateLeadStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            if (!Enum.TryParse<LeadStatus>(request.Status, true, out var status))
            {
                return BadRequest(new { error = "Invalid status value" });
            }

            var success = await _crmManagementService.UpdateLeadStatusAsync(id, status);
            
            if (!success)
            {
                return NotFound(new { error = "Lead not found" });
            }

            return Ok(new { success = true, message = "Lead status updated successfully", status = status.ToString() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lead status");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get pipeline statistics
    /// </summary>
    [HttpGet("pipeline/stats")]
    public async Task<IActionResult> GetPipelineStats()
    {
        try
        {
            var stats = await _crmManagementService.GetPipelineStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pipeline statistics");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get leads by status (for pipeline view)
    /// </summary>
    [HttpGet("pipeline/{status}")]
    public async Task<IActionResult> GetLeadsByStatus(string status)
    {
        try
        {
            if (!Enum.TryParse<LeadStatus>(status, true, out var leadStatus))
            {
                return BadRequest(new { error = "Invalid status value" });
            }

            var leads = await _crmManagementService.GetLeadsByStatusAsync(leadStatus);
            return Ok(leads);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leads by status");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get top leads by score
    /// </summary>
    [HttpGet("leads/top")]
    public async Task<IActionResult> GetTopLeads([FromQuery] int count = 10)
    {
        try
        {
            var leads = await _crmManagementService.GetTopLeadsAsync(count);
            return Ok(leads);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top leads");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get leads by buyer type statistics
    /// </summary>
    [HttpGet("leads/buyer-types")]
    public async Task<IActionResult> GetLeadsByBuyerType()
    {
        try
        {
            var stats = await _crmManagementService.GetLeadsByBuyerTypeAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leads by buyer type");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Calculate lead score (utility endpoint for testing)
    /// </summary>
    [HttpPost("leads/calculate-score")]
    public IActionResult CalculateScore([FromBody] CalculateScoreRequest request)
    {
        try
        {
            if (!Enum.TryParse<Timeline>(request.Timeline, true, out var timeline))
            {
                return BadRequest(new { error = "Invalid timeline value" });
            }

            if (!Enum.TryParse<BuyerType>(request.BuyerType, true, out var buyerType))
            {
                return BadRequest(new { error = "Invalid buyer type value" });
            }

            var score = _crmService.CalculateLeadScore(request.BudgetMax, timeline, buyerType);

            return Ok(new 
            { 
                score,
                rating = score >= 80 ? "High" : score >= 60 ? "Medium" : "Low",
                budgetMax = request.BudgetMax,
                timeline = timeline.ToString(),
                buyerType = buyerType.ToString()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating lead score");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Search leads by keyword
    /// </summary>
    [HttpGet("leads/search")]
    public async Task<IActionResult> SearchLeads([FromQuery] string searchTerm, 
        [FromQuery] int limit = 20, [FromQuery] int offset = 0)
    {
        try
        {
            var filters = new LeadFilterOptions
            {
                SearchTerm = searchTerm,
                Limit = limit,
                Offset = offset
            };

            var result = await _crmManagementService.GetLeadsWithFiltersAsync(filters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching leads");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get conversion rate statistics
    /// </summary>
    [HttpGet("stats/conversion")]
    public async Task<IActionResult> GetConversionStats()
    {
        try
        {
            var allLeads = await _unitOfWork.Repository<Lead>().GetAllAsync();
            var totalLeads = allLeads.Count();
            var convertedLeads = allLeads.Count(l => l.Status == LeadStatus.Converted);
            var lostLeads = allLeads.Count(l => l.Status == LeadStatus.Lost);
            var activeLeads = totalLeads - convertedLeads - lostLeads;

            var conversionRate = totalLeads > 0 ? (decimal)convertedLeads / totalLeads * 100 : 0;
            var lossRate = totalLeads > 0 ? (decimal)lostLeads / totalLeads * 100 : 0;

            return Ok(new
            {
                totalLeads,
                convertedLeads,
                lostLeads,
                activeLeads,
                conversionRate = Math.Round(conversionRate, 2),
                lossRate = Math.Round(lossRate, 2)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving conversion statistics");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Convert lead to customer
    /// </summary>
    [HttpPost("leads/{id}/convert")]
    public async Task<IActionResult> ConvertLead(Guid id, [FromBody] ConvertLeadRequest request)
    {
        try
        {
            var lead = await _unitOfWork.Repository<Lead>().GetByIdAsync(id);
            
            if (lead == null)
            {
                return NotFound(new { error = "Lead not found" });
            }

            var customer = new Customer
            {
                Email = lead.Email,
                FullName = $"{lead.FirstName} {lead.LastName}",
                Phone = lead.Phone,
                Nationality = lead.Country,
                Company = request.Company,
                CustomerRequirements = request.Requirements,
                RiskLevel = request.RiskLevel != null ? Enum.Parse<RiskLevel>(request.RiskLevel) : RiskLevel.Medium,
                ConversionDate = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Customer>().AddAsync(customer);
            
            lead.Status = LeadStatus.Converted;
            lead.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Lead>().UpdateAsync(lead);
            
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { success = true, customerId = customer.Id, message = "Lead converted to customer successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting lead");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }
}

// Request DTOs
public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class CalculateScoreRequest
{
    public decimal? BudgetMax { get; set; }
    public string Timeline { get; set; } = string.Empty;
    public string BuyerType { get; set; } = string.Empty;
}

public class ConvertLeadRequest
{
    public string? Company { get; set; }
    public string? Requirements { get; set; }
    public string? RiskLevel { get; set; }
}
