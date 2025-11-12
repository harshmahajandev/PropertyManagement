using Microsoft.AspNetCore.Mvc;
using PropertyHub.Application.DTOs;
using PropertyHub.Application.Services;

namespace PropertyHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerPortalController : ControllerBase
{
    private readonly CustomerPortalService _customerPortalService;
    private readonly ILogger<CustomerPortalController> _logger;

    public CustomerPortalController(
        CustomerPortalService customerPortalService,
        ILogger<CustomerPortalController> logger)
    {
        _customerPortalService = customerPortalService;
        _logger = logger;
    }

    // ==================== REGISTRATION & AUTHENTICATION ====================

    /// <summary>
    /// Register a new customer with 60-second quick registration
    /// POST: api/CustomerPortal/register
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(CustomerProfileDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CustomerProfileDto>> RegisterCustomer(
        [FromBody] CustomerRegistrationDto dto)
    {
        try
        {
            var profile = await _customerPortalService.RegisterCustomerAsync(dto);
            _logger.LogInformation("New customer registered: {Email}", dto.Email);
            return CreatedAtAction(nameof(GetProfile), new { customerId = profile.Id }, profile);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration failed: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering customer");
            return StatusCode(500, new { error = "An error occurred while registering" });
        }
    }

    /// <summary>
    /// Customer login (simple email-based authentication)
    /// POST: api/CustomerPortal/login
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(CustomerProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerProfileDto>> Login([FromBody] CustomerLoginDto dto)
    {
        try
        {
            var profile = await _customerPortalService.LoginCustomerAsync(dto);
            _logger.LogInformation("Customer logged in: {Email}", dto.Email);
            return Ok(profile);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Login failed: {Message}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { error = "An error occurred during login" });
        }
    }

    // ==================== PROFILE MANAGEMENT ====================

    /// <summary>
    /// Get customer profile with statistics
    /// GET: api/CustomerPortal/profile/{customerId}
    /// </summary>
    [HttpGet("profile/{customerId}")]
    [ProducesResponseType(typeof(CustomerProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerProfileDto>> GetProfile(Guid customerId)
    {
        try
        {
            var profile = await _customerPortalService.GetCustomerProfileAsync(customerId);
            return Ok(profile);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer profile");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    /// <summary>
    /// Update customer profile
    /// PUT: api/CustomerPortal/profile/{customerId}
    /// </summary>
    [HttpPut("profile/{customerId}")]
    [ProducesResponseType(typeof(CustomerProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerProfileDto>> UpdateProfile(
        Guid customerId,
        [FromBody] UpdateCustomerProfileDto dto)
    {
        try
        {
            var profile = await _customerPortalService.UpdateCustomerProfileAsync(customerId, dto);
            _logger.LogInformation("Customer profile updated: {CustomerId}", customerId);
            return Ok(profile);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating customer profile");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    // ==================== DASHBOARD ====================

    /// <summary>
    /// Get complete customer dashboard with all data
    /// GET: api/CustomerPortal/dashboard/{customerId}
    /// </summary>
    [HttpGet("dashboard/{customerId}")]
    [ProducesResponseType(typeof(CustomerDashboardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerDashboardDto>> GetDashboard(Guid customerId)
    {
        try
        {
            var dashboard = await _customerPortalService.GetCustomerDashboardAsync(customerId);
            return Ok(dashboard);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer dashboard");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    /// <summary>
    /// Get customer statistics
    /// GET: api/CustomerPortal/statistics/{customerId}
    /// </summary>
    [HttpGet("statistics/{customerId}")]
    [ProducesResponseType(typeof(CustomerStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CustomerStatisticsDto>> GetStatistics(Guid customerId)
    {
        try
        {
            var statistics = await _customerPortalService.GetCustomerStatisticsAsync(customerId);
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer statistics");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    // ==================== PREFERENCES MANAGEMENT ====================

    /// <summary>
    /// Get customer preferences
    /// GET: api/CustomerPortal/preferences/{customerId}
    /// </summary>
    [HttpGet("preferences/{customerId}")]
    [ProducesResponseType(typeof(CustomerPreferencesDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CustomerPreferencesDto>> GetPreferences(Guid customerId)
    {
        try
        {
            var preferences = await _customerPortalService.GetCustomerPreferencesAsync(customerId);
            return Ok(preferences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer preferences");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    /// <summary>
    /// Update customer preferences (generates new recommendations)
    /// PUT: api/CustomerPortal/preferences/{customerId}
    /// </summary>
    [HttpPut("preferences/{customerId}")]
    [ProducesResponseType(typeof(CustomerPreferencesDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CustomerPreferencesDto>> UpdatePreferences(
        Guid customerId,
        [FromBody] UpdateCustomerPreferencesDto dto)
    {
        try
        {
            var preferences = await _customerPortalService.UpdateCustomerPreferencesAsync(customerId, dto);
            _logger.LogInformation("Customer preferences updated: {CustomerId}", customerId);
            return Ok(preferences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating customer preferences");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    // ==================== PROPERTY RECOMMENDATIONS ====================

    /// <summary>
    /// Get AI-powered property recommendations with confidence scores
    /// GET: api/CustomerPortal/recommendations/{customerId}
    /// </summary>
    [HttpGet("recommendations/{customerId}")]
    [ProducesResponseType(typeof(List<PropertyRecommendationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PropertyRecommendationDto>>> GetRecommendations(
        Guid customerId,
        [FromQuery] int take = 10)
    {
        try
        {
            var recommendations = await _customerPortalService.GetPropertyRecommendationsAsync(
                customerId, 
                take);
            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving property recommendations");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    /// <summary>
    /// Generate fresh property recommendations based on preferences
    /// POST: api/CustomerPortal/recommendations/{customerId}/generate
    /// </summary>
    [HttpPost("recommendations/{customerId}/generate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GenerateRecommendations(Guid customerId)
    {
        try
        {
            await _customerPortalService.GeneratePropertyRecommendationsAsync(customerId);
            _logger.LogInformation("Property recommendations generated for customer: {CustomerId}", customerId);
            return Ok(new { message = "Recommendations generated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating property recommendations");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    // ==================== BOOKINGS ====================

    /// <summary>
    /// Get customer booking history
    /// GET: api/CustomerPortal/bookings/{customerId}
    /// </summary>
    [HttpGet("bookings/{customerId}")]
    [ProducesResponseType(typeof(List<CustomerBookingDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CustomerBookingDto>>> GetBookings(
        Guid customerId,
        [FromQuery] int? take = null)
    {
        try
        {
            var bookings = await _customerPortalService.GetCustomerBookingsAsync(customerId, take);
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer bookings");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    /// <summary>
    /// Create a new booking (viewing, reservation, or purchase)
    /// POST: api/CustomerPortal/bookings/{customerId}
    /// </summary>
    [HttpPost("bookings/{customerId}")]
    [ProducesResponseType(typeof(CustomerBookingDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CustomerBookingDto>> CreateBooking(
        Guid customerId,
        [FromBody] CreateCustomerBookingDto dto)
    {
        try
        {
            var booking = await _customerPortalService.CreateCustomerBookingAsync(customerId, dto);
            _logger.LogInformation(
                "New booking created for customer {CustomerId}, property {PropertyId}", 
                customerId, 
                dto.PropertyId);
            return CreatedAtAction(nameof(GetBookings), new { customerId }, booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating booking");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    // ==================== MESSAGES ====================

    /// <summary>
    /// Get customer messages (inbox and sent)
    /// GET: api/CustomerPortal/messages/{customerId}
    /// </summary>
    [HttpGet("messages/{customerId}")]
    [ProducesResponseType(typeof(List<CustomerMessageDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CustomerMessageDto>>> GetMessages(
        Guid customerId,
        [FromQuery] int? take = null)
    {
        try
        {
            var messages = await _customerPortalService.GetCustomerMessagesAsync(customerId, take);
            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer messages");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    /// <summary>
    /// Send a message to another user or agent
    /// POST: api/CustomerPortal/messages/{customerId}/send
    /// </summary>
    [HttpPost("messages/{customerId}/send")]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CustomerMessageDto>> SendMessage(
        Guid customerId,
        [FromBody] SendCustomerMessageDto dto)
    {
        try
        {
            var message = await _customerPortalService.SendCustomerMessageAsync(customerId, dto);
            _logger.LogInformation(
                "Message sent from customer {FromId} to {ToId}", 
                customerId, 
                dto.ToUserId);
            return CreatedAtAction(nameof(GetMessages), new { customerId }, message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    /// <summary>
    /// Mark a message as read
    /// PUT: api/CustomerPortal/messages/{messageId}/read
    /// </summary>
    [HttpPut("messages/{messageId}/read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> MarkMessageAsRead(
        Guid messageId,
        [FromQuery] Guid customerId)
    {
        try
        {
            await _customerPortalService.MarkMessageAsReadAsync(messageId, customerId);
            return Ok(new { message = "Message marked as read" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking message as read");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    // ==================== RESERVATIONS ====================

    /// <summary>
    /// Get customer reservations
    /// GET: api/CustomerPortal/reservations/{customerId}
    /// </summary>
    [HttpGet("reservations/{customerId}")]
    [ProducesResponseType(typeof(List<CustomerReservationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CustomerReservationDto>>> GetReservations(Guid customerId)
    {
        try
        {
            var reservations = await _customerPortalService.GetCustomerReservationsAsync(customerId);
            return Ok(reservations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer reservations");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    // ==================== HEALTH CHECK ====================

    /// <summary>
    /// Customer Portal health check
    /// GET: api/CustomerPortal/health
    /// </summary>
    [HttpGet("health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult HealthCheck()
    {
        return Ok(new
        {
            status = "healthy",
            module = "CustomerPortal",
            timestamp = DateTime.UtcNow,
            features = new[]
            {
                "Registration",
                "Profile Management",
                "Property Recommendations",
                "Booking Management",
                "Message Center",
                "Dashboard"
            }
        });
    }
}
