namespace PropertyHub.Core.Enums;

// Property Module Enums
public enum PropertyStatus
{
    Available,
    Reserved,
    Sold,
    Maintenance,
    UnderConstruction
}

public enum PropertyType
{
    Villa,
    Apartment,
    Penthouse,
    Commercial,
    Plot,
    Investment
}

// CRM Module Enums
public enum LeadStatus
{
    New,
    Contacted,
    Qualified,
    Viewing,
    Negotiating,
    Converted,
    Lost
}

public enum BuyerType
{
    HNI,
    Investor,
    Retail,
    Commercial
}

public enum Timeline
{
    Immediate,
    OneToThreeMonths,
    ThreeToSixMonths,
    SixToTwelveMonths,
    Flexible
}

// Reservation Module Enums
public enum ReservationStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed,
    Expired
}

public enum PaymentStatus
{
    Pending,
    Paid,
    Refunded,
    PartiallyPaid
}

public enum BookingType
{
    Viewing,
    Reservation,
    Purchase
}

// Snagging Module Enums
public enum IssueCategory
{
    Electrical,
    Plumbing,
    Finishing,
    Structural,
    Painting,
    Fixtures,
    Other
}

public enum IssuePriority
{
    Low,
    Medium,
    High,
    Urgent
}

public enum IssueStatus
{
    Identified,
    Assigned,
    InProgress,
    Resolved,
    Verified,
    Closed
}

public enum ProjectStatus
{
    Planning,
    InProgress,
    OnHold,
    Completed,
    Cancelled
}

// User and Role Enums
public enum UserRole
{
    Admin,
    Manager,
    SalesAgent,
    SalesManager,
    ProjectManager,
    Inspector,
    Accountant,
    Customer,
    Executive
}

// Financial Enums
public enum Currency
{
    USD,
    EUR,
    GBP,
    AED,
    CAD,
    AUD,
    SGD,
    JPY,
    BHD
}

public enum TransactionType
{
    Income,
    Expense,
    Investment,
    Refund
}

// Communication Enums
public enum MessageType
{
    Inquiry,
    Booking,
    Marketing,
    General,
    Support
}

public enum Priority
{
    Low,
    Medium,
    High
}

// Analytics Enums
public enum MetricType
{
    Financial,
    Market,
    Performance,
    ESG,
    Development
}

public enum Period
{
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly
}

public enum InvestmentType
{
    Direct,
    REIT,
    Partnership,
    Development
}

public enum RiskLevel
{
    Low,
    Medium,
    High
}
