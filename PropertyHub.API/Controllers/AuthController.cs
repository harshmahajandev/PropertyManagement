using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PropertyHub.Core.Entities;
using PropertyHub.Core.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PropertyHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IConfiguration configuration,
        IUnitOfWork unitOfWork,
        ILogger<AuthController> logger)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user/customer
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        try
        {
            // Check if email already exists
            var existingCustomers = await _unitOfWork.Repository<Customer>().GetAllAsync();
            if (existingCustomers.Any(c => c.Email.ToLower() == dto.Email.ToLower()))
            {
                return BadRequest(new { error = "Email already registered" });
            }

            // Create new customer
            var customer = new Customer
            {
                Email = dto.Email,
                FullName = dto.FullName,
                Phone = dto.Phone,
                Nationality = dto.Nationality,
                Company = dto.Company,
                CustomerRequirements = dto.Requirements,
                RiskLevel = Core.Enums.RiskLevel.Low,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Customer>().AddAsync(customer);
            await _unitOfWork.SaveChangesAsync();

            // Generate JWT token
            var token = GenerateJwtToken(customer);

            _logger.LogInformation("New user registered: {Email}", dto.Email);

            return CreatedAtAction(nameof(GetProfile), new { id = customer.Id }, new AuthResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpiration()),
                User = new UserDto
                {
                    Id = customer.Id,
                    Email = customer.Email,
                    FullName = customer.FullName,
                    Phone = customer.Phone,
                    Role = "Customer"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, new { error = "An error occurred during registration" });
        }
    }

    /// <summary>
    /// Login with email (simplified authentication for demo)
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        try
        {
            // Check for admin login
            if (dto.Email.ToLower() == "admin@propertyhub.com" && dto.Password == "Admin@123")
            {
                var adminToken = GenerateJwtToken(null, isAdmin: true);
                return Ok(new AuthResponseDto
                {
                    Token = adminToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpiration()),
                    User = new UserDto
                    {
                        Id = Guid.Empty,
                        Email = "admin@propertyhub.com",
                        FullName = "System Administrator",
                        Role = "Admin"
                    }
                });
            }

            // Find customer by email
            var customers = await _unitOfWork.Repository<Customer>().GetAllAsync();
            var customer = customers.FirstOrDefault(c => c.Email.ToLower() == dto.Email.ToLower());

            if (customer == null)
            {
                return Unauthorized(new { error = "Invalid email or password" });
            }

            // Generate JWT token
            var token = GenerateJwtToken(customer);

            _logger.LogInformation("User logged in: {Email}", dto.Email);

            return Ok(new AuthResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpiration()),
                User = new UserDto
                {
                    Id = customer.Id,
                    Email = customer.Email,
                    FullName = customer.FullName,
                    Phone = customer.Phone,
                    Role = "Customer"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { error = "An error occurred during login" });
        }
    }

    /// <summary>
    /// Get user profile
    /// </summary>
    [HttpGet("profile/{id}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetProfile(Guid id)
    {
        try
        {
            var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(id);
            
            if (customer == null)
            {
                return NotFound(new { error = "User not found" });
            }

            return Ok(new UserDto
            {
                Id = customer.Id,
                Email = customer.Email,
                FullName = customer.FullName,
                Phone = customer.Phone,
                Nationality = customer.Nationality,
                Company = customer.Company,
                Role = "Customer"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user profile");
            return StatusCode(500, new { error = "An error occurred" });
        }
    }

    /// <summary>
    /// Refresh JWT token
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenDto dto)
    {
        try
        {
            // Validate and decode the existing token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JWT:SecretKey"] ?? "DefaultSecretKey123456789012345678901234567890");
            
            var principal = tokenHandler.ValidateToken(dto.Token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["JWT:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["JWT:Audience"],
                ValidateLifetime = false // Allow expired tokens for refresh
            }, out var validatedToken);

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { error = "Invalid token" });
            }

            // Check if this is an admin token
            if (userIdClaim == Guid.Empty.ToString())
            {
                var adminToken = GenerateJwtToken(null, isAdmin: true);
                return Ok(new AuthResponseDto
                {
                    Token = adminToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpiration()),
                    User = new UserDto
                    {
                        Id = Guid.Empty,
                        Email = "admin@propertyhub.com",
                        FullName = "System Administrator",
                        Role = "Admin"
                    }
                });
            }

            // Get customer
            var customerId = Guid.Parse(userIdClaim);
            var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(customerId);
            
            if (customer == null)
            {
                return Unauthorized(new { error = "User not found" });
            }

            // Generate new token
            var newToken = GenerateJwtToken(customer);

            return Ok(new AuthResponseDto
            {
                Token = newToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpiration()),
                User = new UserDto
                {
                    Id = customer.Id,
                    Email = customer.Email,
                    FullName = customer.FullName,
                    Phone = customer.Phone,
                    Role = "Customer"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return Unauthorized(new { error = "Invalid token" });
        }
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new
        {
            status = "healthy",
            service = "Authentication",
            timestamp = DateTime.UtcNow
        });
    }

    private string GenerateJwtToken(Customer? customer, bool isAdmin = false)
    {
        var secretKey = _configuration["JWT:SecretKey"] ?? "DefaultSecretKey123456789012345678901234567890";
        var issuer = _configuration["JWT:Issuer"] ?? "PropertyHubGlobal";
        var audience = _configuration["JWT:Audience"] ?? "PropertyHubClients";
        var expiration = GetTokenExpiration();

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

        if (isAdmin)
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, Guid.Empty.ToString()));
            claims.Add(new Claim(ClaimTypes.Email, "admin@propertyhub.com"));
            claims.Add(new Claim(ClaimTypes.Name, "System Administrator"));
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));
        }
        else if (customer != null)
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()));
            claims.Add(new Claim(ClaimTypes.Email, customer.Email));
            claims.Add(new Claim(ClaimTypes.Name, customer.FullName));
            claims.Add(new Claim(ClaimTypes.Role, "Customer"));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiration),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private int GetTokenExpiration()
    {
        return int.TryParse(_configuration["JWT:ExpirationInMinutes"], out var minutes) ? minutes : 1440;
    }
}

// Auth DTOs
public class RegisterDto
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Nationality { get; set; }
    public string? Company { get; set; }
    public string? Requirements { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
}

public class RefreshTokenDto
{
    public string Token { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; } = new();
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Nationality { get; set; }
    public string? Company { get; set; }
    public string Role { get; set; } = string.Empty;
}
