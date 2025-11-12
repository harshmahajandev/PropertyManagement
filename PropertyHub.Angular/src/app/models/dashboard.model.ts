// Dashboard Models
export interface DashboardSummaryDto {
  propertyStats: PropertyStatsDto;
  leadStats: LeadStatsDto;
  reservationStats: ReservationStatsDto;
  financialStats: FinancialStatsDto;
  recentActivities: ActivityDto[];
  topProperties: TopPropertyDto[];
  leadsBySegment: { [key: string]: number };
  reservationsByStatus: { [key: string]: number };
  generatedAt: Date;
}

export interface PropertyStatsDto {
  totalProperties: number;
  availableProperties: number;
  reservedProperties: number;
  soldProperties: number;
  averagePrice: number;
  totalValue: number;
  averageSize: number;
  viewCount: number;
  inquiryCount: number;
  tourCount: number;
  offerCount: number;
}

export interface LeadStatsDto {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageLeadScore: number;
  leadsThisMonth: number;
  leadsLastMonth: number;
  growthRate: number;
}

export interface ReservationStatsDto {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  totalValue: number;
  averageReservationValue: number;
  averageDepositPercentage: number;
  conversionRate: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

export interface FinancialStatsDto {
  totalRevenue: number;
  totalCommissions: number;
  averageCommission: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  monthlyGrowthRate: number;
  pendingPayments: number;
  averagePropertyPrice: number;
  currency: string;
}

export interface ActivityDto {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId: string;
  userName: string;
  entityId: string;
  entityType: string;
  timestamp: Date;
  metadata?: any;
}

export enum ActivityType {
  LeadCreated = 'LeadCreated',
  LeadConverted = 'LeadConverted',
  PropertyAdded = 'PropertyAdded',
  PropertyViewed = 'PropertyViewed',
  PropertyInquired = 'PropertyInquired',
  PropertyToured = 'PropertyToured',
  PropertyOffered = 'PropertyOffered',
  ReservationCreated = 'ReservationCreated',
  ReservationConfirmed = 'ReservationConfirmed',
  ReservationCancelled = 'ReservationCancelled',
  CustomerRegistered = 'CustomerRegistered',
  MessageSent = 'MessageSent',
  UserLoggedIn = 'UserLoggedIn'
}

export interface ProjectStatisticsDto {
  projectName: string;
  totalProperties: number;
  availableProperties: number;
  soldProperties: number;
  reservedProperties: number;
  averagePrice: number;
  totalValue: number;
  viewCount: number;
  inquiryCount: number;
  conversionRate: number;
}

export interface LeadConversionDto {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageTimeToConvert: number;
  topConvertingSources: string[];
  revenueFromConversions: number;
}

export interface MonthlyStatsDto {
  month: string;
  year: number;
  leads: number;
  conversions: number;
  revenue: number;
  properties: number;
}