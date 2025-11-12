using PropertyHub.Core.Entities;
using PropertyHub.Core.Enums;
using PropertyHub.Core.Interfaces;

namespace PropertyHub.Application.Services;

/// <summary>
/// CRM Service - Implements Lead Scoring Algorithm and CRM Business Logic
/// </summary>
public class CRMService
{
    private readonly IUnitOfWork _unitOfWork;

    public CRMService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Calculate Lead Score: score = 50 + budget_score + timeline_score + buyer_type_score (capped at 100)
    /// </summary>
    public int CalculateLeadScore(decimal? budgetMax, Timeline timeline, BuyerType buyerType)
    {
        int baseScore = 50;
        int budgetScore = CalculateBudgetScore(budgetMax);
        int timelineScore = CalculateTimelineScore(timeline);
        int buyerTypeScore = CalculateBuyerTypeScore(buyerType);

        int totalScore = baseScore + budgetScore + timelineScore + buyerTypeScore;
        return Math.Min(totalScore, 100); // Cap at 100
    }

    /// <summary>
    /// Budget Score: if (budget > 500000) +30; else if (budget > 200000) +20; else if (budget > 100000) +10
    /// </summary>
    private int CalculateBudgetScore(decimal? budgetMax)
    {
        if (!budgetMax.HasValue) return 0;
        
        if (budgetMax > 500000) return 30;
        if (budgetMax > 200000) return 20;
        if (budgetMax > 100000) return 10;
        return 0;
    }

    /// <summary>
    /// Timeline Score: if (immediate) +25; else if (1-3 months) +15; else if (3-6 months) +10
    /// </summary>
    private int CalculateTimelineScore(Timeline timeline)
    {
        return timeline switch
        {
            Timeline.Immediate => 25,
            Timeline.OneToThreeMonths => 15,
            Timeline.ThreeToSixMonths => 10,
            Timeline.SixToTwelveMonths => 5,
            _ => 0
        };
    }

    /// <summary>
    /// Buyer Type Score: if (HNI) +20; else if (investor) +15
    /// </summary>
    private int CalculateBuyerTypeScore(BuyerType buyerType)
    {
        return buyerType switch
        {
            BuyerType.HNI => 20,
            BuyerType.Investor => 15,
            BuyerType.Commercial => 10,
            _ => 0
        };
    }
}

/// <summary>
/// Analytics Service - Implements all Financial and Analytics Formulas
/// </summary>
public class AnalyticsService
{
    /// <summary>
    /// Net Profit = total_revenue - total_expenses
    /// </summary>
    public decimal CalculateNetProfit(decimal totalRevenue, decimal totalExpenses)
    {
        return totalRevenue - totalExpenses;
    }

    /// <summary>
    /// Profit Margin = (net_profit / total_revenue) * 100
    /// </summary>
    public decimal CalculateProfitMargin(decimal netProfit, decimal totalRevenue)
    {
        if (totalRevenue == 0) return 0;
        return (netProfit / totalRevenue) * 100;
    }

    /// <summary>
    /// Revenue Growth = ((current_revenue - previous_revenue) / previous_revenue) * 100
    /// </summary>
    public decimal CalculateRevenueGrowth(decimal currentRevenue, decimal previousRevenue)
    {
        if (previousRevenue == 0) return 0;
        return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    }

    /// <summary>
    /// Expense Ratio = (total_expenses / total_revenue) * 100
    /// </summary>
    public decimal CalculateExpenseRatio(decimal totalExpenses, decimal totalRevenue)
    {
        if (totalRevenue == 0) return 0;
        return (totalExpenses / totalRevenue) * 100;
    }

    /// <summary>
    /// ROI Percentage = ((current_value - initial_value) / initial_value) * 100
    /// </summary>
    public decimal CalculateROI(decimal currentValue, decimal initialValue)
    {
        if (initialValue == 0) return 0;
        return ((currentValue - initialValue) / initialValue) * 100;
    }

    /// <summary>
    /// Price Change Percentage = ((new_price - old_price) / old_price) * 100
    /// </summary>
    public decimal CalculatePriceChange(decimal newPrice, decimal oldPrice)
    {
        if (oldPrice == 0) return 0;
        return ((newPrice - oldPrice) / oldPrice) * 100;
    }

    /// <summary>
    /// Sales Rate = (sold_properties / total_properties) * 100
    /// </summary>
    public decimal CalculateSalesRate(int soldProperties, int totalProperties)
    {
        if (totalProperties == 0) return 0;
        return ((decimal)soldProperties / totalProperties) * 100;
    }

    /// <summary>
    /// EBITDA = net_profit + interest + taxes + depreciation + amortization
    /// </summary>
    public decimal CalculateEBITDA(decimal netProfit, decimal interest, decimal taxes, 
        decimal depreciation, decimal amortization)
    {
        return netProfit + interest + taxes + depreciation + amortization;
    }

    /// <summary>
    /// Cash Flow = operating_cash + investing_cash + financing_cash
    /// </summary>
    public decimal CalculateCashFlow(decimal operatingCash, decimal investingCash, decimal financingCash)
    {
        return operatingCash + investingCash + financingCash;
    }

    /// <summary>
    /// Growth Rate = ((current - previous) / previous) * 100
    /// </summary>
    public decimal CalculateGrowthRate(decimal current, decimal previous)
    {
        if (previous == 0) return 0;
        return ((current - previous) / previous) * 100;
    }

    /// <summary>
    /// Budget Variance = actual - budgeted
    /// </summary>
    public decimal CalculateBudgetVariance(decimal actual, decimal budgeted)
    {
        return actual - budgeted;
    }

    /// <summary>
    /// Variance Percentage = (variance / budgeted) * 100
    /// </summary>
    public decimal CalculateVariancePercentage(decimal variance, decimal budgeted)
    {
        if (budgeted == 0) return 0;
        return (variance / budgeted) * 100;
    }

    /// <summary>
    /// Collections Rate = (paid_amount / total_amount) * 100
    /// </summary>
    public decimal CalculateCollectionsRate(decimal paidAmount, decimal totalAmount)
    {
        if (totalAmount == 0) return 0;
        return (paidAmount / totalAmount) * 100;
    }

    /// <summary>
    /// Occupancy Rate = (occupied_units / total_units) * 100
    /// </summary>
    public decimal CalculateOccupancyRate(int occupiedUnits, int totalUnits)
    {
        if (totalUnits == 0) return 0;
        return ((decimal)occupiedUnits / totalUnits) * 100;
    }

    /// <summary>
    /// Operating Cash Flow Ratio = operating_cash_flow / current_liabilities
    /// </summary>
    public decimal CalculateOperatingCashFlowRatio(decimal operatingCashFlow, decimal currentLiabilities)
    {
        if (currentLiabilities == 0) return 0;
        return operatingCashFlow / currentLiabilities;
    }

    /// <summary>
    /// Cash Flow to Debt Ratio = operating_cash_flow / total_debt
    /// </summary>
    public decimal CalculateCashFlowToDebtRatio(decimal operatingCashFlow, decimal totalDebt)
    {
        if (totalDebt == 0) return 0;
        return operatingCashFlow / totalDebt;
    }

    /// <summary>
    /// Free Cash Flow = operating_cash_flow - capital_expenditures
    /// </summary>
    public decimal CalculateFreeCashFlow(decimal operatingCashFlow, decimal capitalExpenditures)
    {
        return operatingCashFlow - capitalExpenditures;
    }

    /// <summary>
    /// Completion Percentage = (actual_progress / total_planned) * 100
    /// </summary>
    public decimal CalculateCompletionPercentage(decimal actualProgress, decimal totalPlanned)
    {
        if (totalPlanned == 0) return 0;
        return (actualProgress / totalPlanned) * 100;
    }

    /// <summary>
    /// Budget Utilization = (budget_spent / budget_allocated) * 100
    /// </summary>
    public decimal CalculateBudgetUtilization(decimal budgetSpent, decimal budgetAllocated)
    {
        if (budgetAllocated == 0) return 0;
        return (budgetSpent / budgetAllocated) * 100;
    }

    /// <summary>
    /// Absorption Rate = (units_sold / units_planned) * 100
    /// </summary>
    public decimal CalculateAbsorptionRate(int unitsSold, int unitsPlanned)
    {
        if (unitsPlanned == 0) return 0;
        return ((decimal)unitsSold / unitsPlanned) * 100;
    }

    /// <summary>
    /// Revenue per Unit = total_revenue / units_sold
    /// </summary>
    public decimal CalculateRevenuePerUnit(decimal totalRevenue, int unitsSold)
    {
        if (unitsSold == 0) return 0;
        return totalRevenue / unitsSold;
    }

    /// <summary>
    /// ESG Score = (metric_value / target_value) * 100
    /// </summary>
    public decimal CalculateESGScore(decimal metricValue, decimal targetValue)
    {
        if (targetValue == 0) return 0;
        return (metricValue / targetValue) * 100;
    }

    /// <summary>
    /// Target Achievement = (actual_value / target_value) * 100
    /// </summary>
    public decimal CalculateTargetAchievement(decimal actualValue, decimal targetValue)
    {
        if (targetValue == 0) return 0;
        return (actualValue / targetValue) * 100;
    }
}

/// <summary>
/// Reservation Service - Implements Deposit Calculations and Reservation Logic
/// </summary>
public class ReservationService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReservationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Deposit Amount = property_price * (deposit_percentage / 100)
    /// </summary>
    public decimal CalculateDepositAmount(decimal propertyPrice, decimal depositPercentage)
    {
        return propertyPrice * (depositPercentage / 100);
    }

    /// <summary>
    /// Hold End Date = reservation_date + hold_duration_days
    /// </summary>
    public DateTime CalculateHoldEndDate(DateTime reservationDate, int holdDurationDays)
    {
        return reservationDate.AddDays(holdDurationDays);
    }

    /// <summary>
    /// Generate unique reservation number
    /// </summary>
    public string GenerateReservationNumber()
    {
        return $"RES-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }
}

/// <summary>
/// Property Service - Implements Property Analytics and Matching Logic
/// </summary>
public class PropertyService
{
    /// <summary>
    /// Interest Score = (views * 0.1) + (inquiries * 2) + (tours * 5) + (offers * 10)
    /// </summary>
    public decimal CalculateInterestScore(int views, int inquiries, int tours, int offers)
    {
        return (views * 0.1m) + (inquiries * 2) + (tours * 5) + (offers * 10);
    }

    /// <summary>
    /// Conversion Rate = (offers / inquiries) * 100
    /// </summary>
    public decimal CalculateConversionRate(int offers, int inquiries)
    {
        if (inquiries == 0) return 0;
        return ((decimal)offers / inquiries) * 100;
    }

    /// <summary>
    /// Lead Match Score = hni_leads * 3 + investor_leads * 2 + retail_leads * 1
    /// </summary>
    public int CalculateLeadMatchScore(int hniLeads, int investorLeads, int retailLeads)
    {
        return (hniLeads * 3) + (investorLeads * 2) + retailLeads;
    }

    /// <summary>
    /// Recommendation Confidence = (preference_match_count / total_preferences) * 100
    /// </summary>
    public int CalculateRecommendationConfidence(int preferenceMatchCount, int totalPreferences)
    {
        if (totalPreferences == 0) return 0;
        return (preferenceMatchCount * 100) / totalPreferences;
    }
}

/// <summary>
/// Snagging Service - Implements Snagging Analytics
/// </summary>
public class SnaggingService
{
    /// <summary>
    /// Project Completion Rate = (resolved_issues / total_issues) * 100
    /// </summary>
    public decimal CalculateCompletionRate(int resolvedIssues, int totalIssues)
    {
        if (totalIssues == 0) return 0;
        return ((decimal)resolvedIssues / totalIssues) * 100;
    }

    /// <summary>
    /// Pending Issues Rate = (pending_issues / total_issues) * 100
    /// </summary>
    public decimal CalculatePendingRate(int pendingIssues, int totalIssues)
    {
        if (totalIssues == 0) return 0;
        return ((decimal)pendingIssues / totalIssues) * 100;
    }

    /// <summary>
    /// Contractor Performance = (completed_projects / total_projects) * 100
    /// </summary>
    public decimal CalculateContractorPerformance(int completedProjects, int totalProjects)
    {
        if (totalProjects == 0) return 0;
        return ((decimal)completedProjects / totalProjects) * 100;
    }
}

/// <summary>
/// Currency Service - Implements Multi-Currency Support
/// </summary>
public class CurrencyService
{
    private readonly IUnitOfWork _unitOfWork;

    public CurrencyService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Currency Conversion = original_amount * exchange_rate
    /// </summary>
    public async Task<decimal> ConvertCurrency(decimal amount, Currency fromCurrency, Currency toCurrency)
    {
        if (fromCurrency == toCurrency) return amount;

        var rate = await _unitOfWork.Repository<CurrencyRate>()
            .FindAsync(r => r.FromCurrency == fromCurrency && r.ToCurrency == toCurrency);

        var exchangeRate = rate.FirstOrDefault();
        if (exchangeRate != null)
        {
            return amount * exchangeRate.ExchangeRate;
        }

        // If direct rate not found, try reverse
        var reverseRate = await _unitOfWork.Repository<CurrencyRate>()
            .FindAsync(r => r.FromCurrency == toCurrency && r.ToCurrency == fromCurrency);

        var reverseExchange = reverseRate.FirstOrDefault();
        if (reverseExchange != null && reverseExchange.ExchangeRate != 0)
        {
            return amount / reverseExchange.ExchangeRate;
        }

        return amount; // Return original if no rate found
    }
}
