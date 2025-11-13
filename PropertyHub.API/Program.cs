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

// ===== AUTHENTICATION DISABLED =====
// Identity Configuration
// builder.Services.AddDefaultIdentity<IdentityUser>(options => 
// {
//     options.SignIn.RequireConfirmedAccount = false;
//     options.Password.RequireDigit = true;
//     options.Password.RequireLowercase = true;
//     options.Password.RequireUppercase = true;
//     options.Password.RequireNonAlphanumeric = true;
//     options.Password.RequiredLength = 8;
// })
//     .AddRoles<IdentityRole>()
//     .AddEntityFrameworkStores<ApplicationDbContext>();

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

// ===== AUTHORIZATION DISABLED =====
// builder.Services.AddAuthorization();

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

// ===== AUTHENTICATION/AUTHORIZATION MIDDLEWARE DISABLED =====
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();


app.Run();
