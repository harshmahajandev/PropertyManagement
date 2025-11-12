using PropertyHub.Core.Entities;
using PropertyHub.Core.Interfaces;
using PropertyHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PropertyHub.Application.Services
{
    public class DashboardService
    {
        private readonly ApplicationDbContext _context;
        private readonly IRepository<Property> _propertyRepository;
        private readonly IRepository<Lead> _leadRepository;
        private readonly IRepository<Reservation> _reservationRepository;
        private readonly IRepository<FinancialReport> _financialRepository;
        private readonly CurrencyConversionService _currencyService;

        public DashboardService(
            ApplicationDbContext context,
            IRepository<Property> propertyRepository,
            IRepository<Lead> leadRepository,
            IRepository<Reservation> reservationRepository,
            IRepository<FinancialReport> financialRepository,
            CurrencyConversionService currencyService)
        {
            _context = context;
            _propertyRepository = propertyRepository;
            _leadRepository = leadRepository;
            _reservationRepository = reservationRepository;
            _financialRepository = financialRepository;
            _currencyService = currencyService;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(string? currency = "USD")
        {
            var summary = new DashboardSummaryDto
            {
                Currency = currency ?? "USD",
                PropertyStats = await GetPropertyStatsAsync(),
                LeadStats = await GetLeadStatsAsync(),
                ReservationStats = await GetReservationStatsAsync(),
                FinancialStats = await GetFinancialStatsAsync(currency),
                RecentActivities = await GetRecentActivitiesAsync(),
                TopProperties = await GetTopPropertiesAsync(5),
                LeadsBySegment = await GetLeadsBySegmentAsync(),
                ReservationsByStatus = await GetReservationsByStatusAsync()
            };

            return summary;
        }

        private async Task<PropertyStatsDto> GetPropertyStatsAsync()
        {
            var properties = await _propertyRepository.GetAllAsync();
            var propertiesList = properties.ToList();

            var totalProperties = propertiesList.Count;
            var availableProperties = propertiesList.Count(p => p.Status == PropertyStatus.Available);
            var reservedProperties = propertiesList.Count(p => p.Status == PropertyStatus.Reserved);
            var soldProperties = propertiesList.Count(p => p.Status == PropertyStatus.Sold);

            // Calculate month-over-month change
            var lastMonth = DateTime.UtcNow.AddMonths(-1);
            var newThisMonth = propertiesList.Count(p => p.CreatedAt >= lastMonth);
            var percentageChange = totalProperties > 0 ? (newThisMonth * 100.0 / totalProperties) : 0;

            return new PropertyStatsDto
            {
                TotalProperties = totalProperties,
                AvailableProperties = availableProperties,
                ReservedProperties = reservedProperties,
                SoldProperties = soldProperties,
                NewThisMonth = newThisMonth,
                PercentageChange = Math.Round(percentageChange, 2)
            };
        }

        private async Task<LeadStatsDto> GetLeadStatsAsync()
        {
            var leads = await _leadRepository.GetAllAsync();
            var leadsList = leads.ToList();

            var totalLeads = leadsList.Count;
            var activeLeads = leadsList.Count(l => l.Status == LeadStatus.New || l.Status == LeadStatus.Contacted || l.Status == LeadStatus.Qualified);
            var qualifiedLeads = leadsList.Count(l => l.Status == LeadStatus.Qualified);
            var convertedLeads = leadsList.Count(l => l.Status == LeadStatus.Converted);
            var highScoreLeads = leadsList.Count(l => l.Score >= 80);

            // Calculate conversion rate
            var conversionRate = totalLeads > 0 ? (convertedLeads * 100.0 / totalLeads) : 0;

            return new LeadStatsDto
            {
                TotalLeads = totalLeads,
                ActiveLeads = activeLeads,
                QualifiedLeads = qualifiedLeads,
                ConvertedLeads = convertedLeads,
                HighScoreLeads = highScoreLeads,
                ConversionRate = Math.Round(conversionRate, 2)
            };
        }

        private async Task<ReservationStatsDto> GetReservationStatsAsync()
        {
            var reservations = await _reservationRepository.GetAllAsync();
            var reservationsList = reservations.ToList();

            var totalReservations = reservationsList.Count;
            var pendingReservations = reservationsList.Count(r => r.Status == ReservationStatus.Pending);
            var confirmedReservations = reservationsList.Count(r => r.Status == ReservationStatus.Confirmed);
            var completedReservations = reservationsList.Count(r => r.Status == ReservationStatus.Completed);
            var cancelledReservations = reservationsList.Count(r => r.Status == ReservationStatus.Cancelled);

            // Calculate this month's reservations
            var thisMonth = DateTime.UtcNow.Month;
            var thisMonthReservations = reservationsList.Count(r => r.CreatedAt.Month == thisMonth);

            return new ReservationStatsDto
            {
                TotalReservations = totalReservations,
                PendingReservations = pendingReservations,
                ConfirmedReservations = confirmedReservations,
                CompletedReservations = completedReservations,
                CancelledReservations = cancelledReservations,
                ThisMonthReservations = thisMonthReservations
            };
        }

        private async Task<FinancialStatsDto> GetFinancialStatsAsync(string? currency)
        {
            var reports = await _financialRepository.GetAllAsync();
            var reportsList = reports.ToList();

            // Calculate totals (simplified - in production, you'd use proper financial calculations)
            var totalRevenue = reportsList.Sum(r => r.TotalRevenue);
            var totalExpenses = reportsList.Sum(r => r.TotalExpenses);
            var netProfit = totalRevenue - totalExpenses;
            var profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;

            // Convert to requested currency if needed
            if (!string.IsNullOrEmpty(currency) && currency != "USD")
            {
                totalRevenue = await _currencyService.ConvertCurrencyAsync(totalRevenue, "USD", currency);
                totalExpenses = await _currencyService.ConvertCurrencyAsync(totalExpenses, "USD", currency);
                netProfit = await _currencyService.ConvertCurrencyAsync(netProfit, "USD", currency);
            }

            // Calculate this month's revenue
            var thisMonth = DateTime.UtcNow.Month;
            var thisMonthRevenue = reportsList.Where(r => r.ReportDate.Month == thisMonth).Sum(r => r.TotalRevenue);

            return new FinancialStatsDto
            {
                TotalRevenue = (double)Math.Round(totalRevenue, 2),
                TotalExpenses = (double)Math.Round(totalExpenses, 2),
                NetProfit = (double)Math.Round(netProfit, 2),
                ProfitMargin = (double)Math.Round(profitMargin, 2),
                ThisMonthRevenue = (double)Math.Round(thisMonthRevenue, 2),
                Currency = currency ?? "USD"
            };
        }

        private async Task<List<ActivityDto>> GetRecentActivitiesAsync()
        {
            var activities = new List<ActivityDto>();

            // Get recent properties
            var recentProperties = await _context.Properties
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .Select(p => new ActivityDto
                {
                    Type = "Property",
                    Description = $"New property added: {p.Title}",
                    Date = p.CreatedAt,
                    Icon = "Home"
                })
                .ToListAsync();

            // Get recent leads
            var recentLeads = await _context.Leads
                .OrderByDescending(l => l.CreatedAt)
                .Take(5)
                .Select(l => new ActivityDto
                {
                    Type = "Lead",
                    Description = $"New lead: {l.FirstName} {l.LastName}",
                    Date = l.CreatedAt,
                    Icon = "Person"
                })
                .ToListAsync();

            // Get recent reservations
            var recentReservations = await _context.Reservations
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new ActivityDto
                {
                    Type = "Reservation",
                    Description = $"New reservation for property #{r.PropertyId}",
                    Date = r.CreatedAt,
                    Icon = "BookOnline"
                })
                .ToListAsync();

            activities.AddRange(recentProperties);
            activities.AddRange(recentLeads);
            activities.AddRange(recentReservations);

            return activities.OrderByDescending(a => a.Date).Take(10).ToList();
        }

        private async Task<List<TopPropertyDto>> GetTopPropertiesAsync(int count)
        {
            var properties = await _context.Properties
                .Include(p => p.Project)
                .OrderByDescending(p => p.Views)
                .Take(count)
                .Select(p => new TopPropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Price = p.Price,
                    Currency = p.Currency,
                    ViewCount = p.Views,
                    Status = p.Status.ToString(),
                    ProjectName = p.Project != null ? p.Project.Name : "N/A"
                })
                .ToListAsync();

            return properties;
        }

        private async Task<Dictionary<string, int>> GetLeadsBySegmentAsync()
        {
            var leads = await _leadRepository.GetAllAsync();
            var leadsList = leads.ToList();

            return new Dictionary<string, int>
            {
                { "HNI", leadsList.Count(l => l.BuyerType == BuyerType.HNI) },
                { "Investor", leadsList.Count(l => l.BuyerType == BuyerType.Investor) },
                { "Retail", leadsList.Count(l => l.BuyerType == BuyerType.Retail) },
                { "Commercial", leadsList.Count(l => l.BuyerType == BuyerType.Commercial) }
            };
        }

        private async Task<Dictionary<string, int>> GetReservationsByStatusAsync()
        {
            var reservations = await _reservationRepository.GetAllAsync();
            var reservationsList = reservations.ToList();

            return new Dictionary<string, int>
            {
                { "Pending", reservationsList.Count(r => r.Status == ReservationStatus.Pending) },
                { "Confirmed", reservationsList.Count(r => r.Status == ReservationStatus.Confirmed) },
                { "Completed", reservationsList.Count(r => r.Status == ReservationStatus.Completed) },
                { "Cancelled", reservationsList.Count(r => r.Status == ReservationStatus.Cancelled) }
            };
        }
    }

    // DTOs for Dashboard
    public class DashboardSummaryDto
    {
        public string Currency { get; set; } = "USD";
        public PropertyStatsDto PropertyStats { get; set; } = new();
        public LeadStatsDto LeadStats { get; set; } = new();
        public ReservationStatsDto ReservationStats { get; set; } = new();
        public FinancialStatsDto FinancialStats { get; set; } = new();
        public List<ActivityDto> RecentActivities { get; set; } = new();
        public List<TopPropertyDto> TopProperties { get; set; } = new();
        public Dictionary<string, int> LeadsBySegment { get; set; } = new();
        public Dictionary<string, int> ReservationsByStatus { get; set; } = new();
    }

    public class PropertyStatsDto
    {
        public int TotalProperties { get; set; }
        public int AvailableProperties { get; set; }
        public int ReservedProperties { get; set; }
        public int SoldProperties { get; set; }
        public int NewThisMonth { get; set; }
        public double PercentageChange { get; set; }
    }

    public class LeadStatsDto
    {
        public int TotalLeads { get; set; }
        public int ActiveLeads { get; set; }
        public int QualifiedLeads { get; set; }
        public int ConvertedLeads { get; set; }
        public int HighScoreLeads { get; set; }
        public double ConversionRate { get; set; }
    }

    public class ReservationStatsDto
    {
        public int TotalReservations { get; set; }
        public int PendingReservations { get; set; }
        public int ConfirmedReservations { get; set; }
        public int CompletedReservations { get; set; }
        public int CancelledReservations { get; set; }
        public int ThisMonthReservations { get; set; }
    }

    public class FinancialStatsDto
    {
        public double TotalRevenue { get; set; }
        public double TotalExpenses { get; set; }
        public double NetProfit { get; set; }
        public double ProfitMargin { get; set; }
        public double ThisMonthRevenue { get; set; }
        public string Currency { get; set; } = "USD";
    }

    public class ActivityDto
    {
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Icon { get; set; } = string.Empty;
    }

    public class TopPropertyDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public int ViewCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
    }
}
