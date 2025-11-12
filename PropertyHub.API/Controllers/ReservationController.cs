using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyHub.Core.Entities;
using PropertyHub.Core.Enums;
using PropertyHub.Core.Interfaces;
using PropertyHub.Application.Services;

namespace PropertyHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ReservationService _reservationService;
    private readonly ILogger<ReservationController> _logger;

    public ReservationController(
        IUnitOfWork unitOfWork,
        ReservationService reservationService,
        ILogger<ReservationController> logger)
    {
        _unitOfWork = unitOfWork;
        _reservationService = reservationService;
        _logger = logger;
    }

    [HttpPost("get-reservations")]
    public async Task<IActionResult> GetReservations([FromBody] ReservationQueryRequest request)
    {
        try
        {
            var query = await _unitOfWork.Repository<Reservation>().GetAllAsync();

            if (request.Status != null)
            {
                if (Enum.TryParse<ReservationStatus>(request.Status, true, out var status))
                {
                    query = query.Where(r => r.Status == status);
                }
            }

            if (request.PropertyId.HasValue)
            {
                query = query.Where(r => r.PropertyId == request.PropertyId.Value);
            }

            if (request.CustomerId.HasValue)
            {
                query = query.Where(r => r.CustomerId == request.CustomerId.Value);
            }

            var reservations = query
                .Skip(request.Offset ?? 0)
                .Take(request.Limit ?? 50)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.PropertyId,
                    r.CustomerId,
                    r.CustomerName,
                    r.CustomerEmail,
                    r.CustomerPhone,
                    Status = r.Status.ToString(),
                    r.TotalAmount,
                    r.DepositAmount,
                    r.DepositPercentage,
                    PaymentStatus = r.PaymentStatus.ToString(),
                    r.ReservationNumber,
                    r.PreferredMoveDate,
                    r.BudgetRange,
                    r.HoldEndDate,
                    r.HoldDurationDays,
                    r.ConfirmedDate,
                    r.CancelledDate,
                    r.CreatedAt
                })
                .ToList();

            return Ok(new { total = query.Count(), reservations });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reservations");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("create-reservation")]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
    {
        try
        {
            var property = await _unitOfWork.Repository<Property>().GetByIdAsync(request.PropertyId);
            
            if (property == null)
            {
                return NotFound(new { error = "Property not found" });
            }

            if (property.Status != PropertyStatus.Available)
            {
                return BadRequest(new { error = "Property is not available for reservation" });
            }

            var depositAmount = _reservationService.CalculateDepositAmount(property.Price, request.DepositPercentage);
            var holdEndDate = _reservationService.CalculateHoldEndDate(DateTime.UtcNow, request.HoldDurationDays);
            var reservationNumber = _reservationService.GenerateReservationNumber();

            var reservation = new Reservation
            {
                PropertyId = request.PropertyId,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                CustomerPhone = request.CustomerPhone,
                Status = ReservationStatus.Pending,
                TotalAmount = property.Price,
                DepositAmount = depositAmount,
                DepositPercentage = request.DepositPercentage,
                PaymentStatus = PaymentStatus.Pending,
                ReservationNumber = reservationNumber,
                PreferredMoveDate = request.PreferredMoveDate,
                BudgetRange = request.BudgetRange,
                SpecialRequirements = request.SpecialRequirements,
                HoldEndDate = holdEndDate,
                HoldDurationDays = request.HoldDurationDays
            };

            await _unitOfWork.Repository<Reservation>().AddAsync(reservation);
            
            // Update property status
            property.Status = PropertyStatus.Reserved;
            await _unitOfWork.Repository<Property>().UpdateAsync(property);
            
            await _unitOfWork.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                reservationId = reservation.Id,
                reservationNumber,
                depositAmount,
                holdEndDate
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating reservation");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("update-reservation-status")]
    public async Task<IActionResult> UpdateReservationStatus([FromBody] UpdateReservationStatusRequest request)
    {
        try
        {
            var reservation = await _unitOfWork.Repository<Reservation>().GetByIdAsync(request.ReservationId);
            
            if (reservation == null)
            {
                return NotFound(new { error = "Reservation not found" });
            }

            var newStatus = Enum.Parse<ReservationStatus>(request.Status);
            reservation.Status = newStatus;

            if (newStatus == ReservationStatus.Confirmed)
            {
                reservation.ConfirmedDate = DateTime.UtcNow;
                
                // Update property status
                var property = await _unitOfWork.Repository<Property>().GetByIdAsync(reservation.PropertyId);
                if (property != null)
                {
                    property.Status = PropertyStatus.Sold;
                    await _unitOfWork.Repository<Property>().UpdateAsync(property);
                }
            }
            else if (newStatus == ReservationStatus.Cancelled)
            {
                reservation.CancelledDate = DateTime.UtcNow;
                
                // Release property
                var property = await _unitOfWork.Repository<Property>().GetByIdAsync(reservation.PropertyId);
                if (property != null)
                {
                    property.Status = PropertyStatus.Available;
                    await _unitOfWork.Repository<Property>().UpdateAsync(property);
                }
            }

            if (!string.IsNullOrEmpty(request.Notes))
            {
                reservation.Notes = request.Notes;
            }

            reservation.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Reservation>().UpdateAsync(reservation);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating reservation status");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("calculate-deposit")]
    public IActionResult CalculateDeposit([FromBody] CalculateDepositRequest request)
    {
        try
        {
            var depositAmount = _reservationService.CalculateDepositAmount(request.PropertyPrice, request.DepositPercentage);
            
            return Ok(new { depositAmount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating deposit");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}

// Request DTOs
public class ReservationQueryRequest
{
    public string? Status { get; set; }
    public Guid? PropertyId { get; set; }
    public Guid? CustomerId { get; set; }
    public int? Limit { get; set; } = 50;
    public int? Offset { get; set; } = 0;
}

public class CreateReservationRequest
{
    public Guid PropertyId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public DateTime? PreferredMoveDate { get; set; }
    public string? BudgetRange { get; set; }
    public string? SpecialRequirements { get; set; }
    public int HoldDurationDays { get; set; } = 7;
    public decimal DepositPercentage { get; set; } = 10;
}

public class UpdateReservationStatusRequest
{
    public Guid ReservationId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CalculateDepositRequest
{
    public decimal PropertyPrice { get; set; }
    public decimal DepositPercentage { get; set; }
}
