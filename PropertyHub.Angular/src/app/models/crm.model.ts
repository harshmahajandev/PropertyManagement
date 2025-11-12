// CRM Models
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: number;
  budgetMax?: number;
  timeline: Timeline;
  buyerType: BuyerType;
  status: LeadStatus;
  score: number;
  source: string;
  notes?: string;
  country?: string;
  nationality?: string;
  preferredContact: string;
  assignedTo?: string;
  assignedToName?: string;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  conversionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum Timeline {
  Immediate = 'Immediate',
  Within1Month = 'Within1Month',
  Within3Months = 'Within3Months',
  Within6Months = 'Within6Months',
  Within1Year = 'Within1Year',
  Exploring = 'Exploring'
}

export enum BuyerType {
  FirstTimeBuyer = 'FirstTimeBuyer',
  Investor = 'Investor',
  Upgrade = 'Upgrade',
  Downsize = 'Downsize',
  Relocation = 'Relocation',
  Commercial = 'Commercial'
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  Converted = 'Converted',
  Lost = 'Lost'
}

export interface LeadFilterOptions {
  searchTerm?: string;
  status?: LeadStatus;
  source?: string;
  buyerType?: BuyerType;
  timeline?: Timeline;
  assignedTo?: string;
  minScore?: number;
  maxScore?: number;
  minBudget?: number;
  maxBudget?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: number;
  budgetMax?: number;
  timeline: string;
  buyerType: string;
  source: string;
  notes?: string;
  country?: string;
  preferredContact?: string;
  assignedTo?: string;
}

export interface UpdateLeadRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  budget?: number;
  budgetMax?: number;
  timeline?: string;
  buyerType?: string;
  source?: string;
  notes?: string;
  country?: string;
  preferredContact?: string;
  assignedTo?: string;
  nextFollowUpDate?: Date;
}

export interface UpdateLeadStatusRequest {
  status: string;
  notes?: string;
  nextFollowUpDate?: Date;
}

export interface PipelineStatsDto {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  proposalLeads: number;
  negotiationLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageScore: number;
  totalValue: number;
  averageValue: number;
}

export interface LeadScoreCalculation {
  score: number;
  rating: 'Low' | 'Medium' | 'High';
  budgetMax: number;
  timeline: Timeline;
  buyerType: BuyerType;
  factors: ScoreFactor[];
}

export interface ScoreFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
}

export interface TopLeadDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  score: number;
  status: LeadStatus;
  budget: number;
  timeline: Timeline;
  buyerType: BuyerType;
  lastContactDate?: Date;
}

export interface ConvertLeadRequest {
  company?: string;
  requirements?: string;
  riskLevel?: string;
}