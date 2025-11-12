using PropertyHub.Core.Enums;

namespace PropertyHub.Application.DTOs;

// ==================== DASHBOARD DTOs ====================

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

// Top Property DTO for dashboard displays
public class TopPropertyDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public int ViewCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
}
