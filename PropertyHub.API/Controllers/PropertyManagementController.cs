using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyHub.Core.Entities;
using PropertyHub.Core.Enums;
using PropertyHub.Core.Interfaces;
using PropertyHub.Application.Services;

namespace PropertyHub.API.Controllers;

[ApiController]
[Route("api/properties")]
//[Authorize] // Temporarily disabled for development
public class PropertyManagementController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly PropertyService _propertyService;
    private readonly PropertyManagementService _propertyManagementService;
    private readonly ILogger<PropertyManagementController> _logger;

    public PropertyManagementController(
        IUnitOfWork unitOfWork,
        PropertyService propertyService,
        PropertyManagementService propertyManagementService,
        ILogger<PropertyManagementController> logger)
    {
        _unitOfWork = unitOfWork;
        _propertyService = propertyService;
        _propertyManagementService = propertyManagementService;
        _logger = logger;
    }

    /// <summary>
    /// Get all properties with advanced filtering and sorting
    /// </summary>
    [HttpPost("list")]
    public async Task<IActionResult> GetProperties([FromBody] PropertyFilterOptions filters)
    {
        try
        {
            var result = await _propertyManagementService.GetPropertiesWithFiltersAsync(filters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving properties");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get property details by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPropertyById(Guid id, [FromQuery] bool incrementView = true)
    {
        try
        {
            var property = await _propertyManagementService.GetPropertyDetailsAsync(id, incrementView);
            
            if (property == null)
            {
                return NotFound(new { error = "Property not found" });
            }

            return Ok(property);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving property details");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Create new property
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyRequest request)
    {
        try
        {
            var property = new Property
            {
                Title = request.Title,
                Project = request.Project,
                Type = Enum.Parse<PropertyType>(request.Type),
                Status = PropertyStatus.Available,
                Price = request.Price,
                Currency = Enum.Parse<Currency>(request.Currency),
                Size = request.Size,
                Bedrooms = request.Bedrooms,
                Bathrooms = request.Bathrooms,
                Location = request.Location,
                Description = request.Description,
                Images = request.Images,
                Amenities = request.Amenities,
                Features = request.Features,
                Latitude = request.Latitude,
                Longitude = request.Longitude
            };

            await _unitOfWork.Repository<Property>().AddAsync(property);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPropertyById), new { id = property.Id }, 
                new { success = true, propertyId = property.Id, message = "Property created successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating property");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Update existing property
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProperty(Guid id, [FromBody] UpdatePropertyRequest request)
    {
        try
        {
            var success = await _propertyManagementService.UpdatePropertyAsync(id, request);
            
            if (!success)
            {
                return NotFound(new { error = "Property not found" });
            }

            return Ok(new { success = true, message = "Property updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating property");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Delete property (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProperty(Guid id)
    {
        try
        {
            var success = await _propertyManagementService.DeletePropertyAsync(id);
            
            if (!success)
            {
                return NotFound(new { error = "Property not found" });
            }

            return Ok(new { success = true, message = "Property deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting property");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Search properties by keyword
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> SearchProperties([FromQuery] string searchTerm, 
        [FromQuery] int limit = 20, [FromQuery] int offset = 0)
    {
        try
        {
            var filters = new PropertyFilterOptions
            {
                SearchTerm = searchTerm,
                Limit = limit,
                Offset = offset
            };

            var result = await _propertyManagementService.GetPropertiesWithFiltersAsync(filters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching properties");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get top performing properties
    /// </summary>
    [HttpGet("top-performers")]
    public async Task<IActionResult> GetTopPerformers([FromQuery] int count = 10)
    {
        try
        {
            var properties = await _propertyManagementService.GetTopPerformingPropertiesAsync(count);
            return Ok(properties);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top performing properties");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get statistics by project
    /// </summary>
    [HttpGet("project-stats")]
    public async Task<IActionResult> GetProjectStats()
    {
        try
        {
            var stats = await _propertyManagementService.GetProjectStatisticsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving project statistics");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Increment property inquiry count
    /// </summary>
    [HttpPost("{id}/inquiry")]
    public async Task<IActionResult> RecordInquiry(Guid id)
    {
        try
        {
            var property = await _unitOfWork.Repository<Property>().GetByIdAsync(id);
            
            if (property == null)
            {
                return NotFound(new { error = "Property not found" });
            }

            property.Inquiries++;
            await _unitOfWork.Repository<Property>().UpdateAsync(property);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { success = true, inquiries = property.Inquiries });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording inquiry");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Increment property tour count
    /// </summary>
    [HttpPost("{id}/tour")]
    public async Task<IActionResult> RecordTour(Guid id)
    {
        try
        {
            var property = await _unitOfWork.Repository<Property>().GetByIdAsync(id);
            
            if (property == null)
            {
                return NotFound(new { error = "Property not found" });
            }

            property.Tours++;
            await _unitOfWork.Repository<Property>().UpdateAsync(property);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { success = true, tours = property.Tours });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording tour");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// Increment property offer count
    /// </summary>
    [HttpPost("{id}/offer")]
    public async Task<IActionResult> RecordOffer(Guid id)
    {
        try
        {
            var property = await _unitOfWork.Repository<Property>().GetByIdAsync(id);
            
            if (property == null)
            {
                return NotFound(new { error = "Property not found" });
            }

            property.Offers++;
            await _unitOfWork.Repository<Property>().UpdateAsync(property);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { success = true, offers = property.Offers });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording offer");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }
}

// Request DTOs
public class CreatePropertyRequest
{
    public string Title { get; set; } = string.Empty;
    public string Project { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
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
