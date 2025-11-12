using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.EntityFrameworkCore;
using PropertyHub.Infrastructure.Data;
using PropertyHub.BlazorApp.Services;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

// Add notification services for Bootstrap conversion
builder.Services.AddScoped<SimpleNotificationService>();
builder.Services.AddScoped<ISnackbar, SimpleSnackbar>();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Identity
builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Add HttpClient for API calls
builder.Services.AddHttpClient("PropertyHubAPI", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7001/api/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// Register application services
builder.Services.AddScoped<ApiService>();
builder.Services.AddScoped<DashboardClientService>();
builder.Services.AddScoped<PropertyClientService>();
builder.Services.AddScoped<CRMClientService>();
// TODO: Add additional services as they are implemented
// builder.Services.AddScoped<ReservationService>();
// builder.Services.AddScoped<AnalyticsService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

app.Run();
