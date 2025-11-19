using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PropertyHub.Infrastructure.Data;
using PropertyHub.Infrastructure.Repositories;
using PropertyHub.Core.Interfaces;
using PropertyHub.Application.Services;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/propertyhub-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// JWT Authentication Configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var secretKey = builder.Configuration["JWT:SecretKey"] ?? "DefaultSecretKey123456789012345678901234567890";
    var issuer = builder.Configuration["JWT:Issuer"] ?? "PropertyHubGlobal";
    var audience = builder.Configuration["JWT:Audience"] ?? "PropertyHubClients";

    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Register repositories and services
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Register business services
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<CRMService>();
builder.Services.AddScoped<CRMManagementService>();
builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddScoped<PropertyService>();
builder.Services.AddScoped<PropertyManagementService>();
builder.Services.AddScoped<SnaggingService>();
builder.Services.AddScoped<CurrencyService>();
builder.Services.AddScoped<CurrencyConversionService>();
builder.Services.AddScoped<CustomerPortalService>();

// Add API Controllers
builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "PropertyHub Global API", 
        Version = "v1",
        Description = "Enterprise Property Management Platform API",
        Contact = new OpenApiContact
        {
            Name = "PropertyHub Support",
            Email = "support@propertyhub.com"
        }
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Authorization Configuration
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CustomerOnly", policy => policy.RequireRole("Customer"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("AllUsers", policy => policy.RequireAuthenticatedUser());
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PropertyHub Global API v1");
        c.RoutePrefix = "api-docs";
    });
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// ===== HTTPS REDIRECTION DISABLED FOR DEVELOPMENT =====
// app.UseHttpsRedirection();  // Disabled - causes CORS issues with Angular
app.UseStaticFiles();

app.UseSerilogRequestLogging();

// IMPORTANT: Apply CORS BEFORE authentication to prevent redirects
app.UseRouting();
app.UseCors("AllowAngular");

// Authentication and Authorization Middleware (ENABLED)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();
