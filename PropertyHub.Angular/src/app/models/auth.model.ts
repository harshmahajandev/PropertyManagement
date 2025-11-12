// Authentication Models
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  customerId: string;
  email: string;
  fullName: string;
  expiresAt: Date;
}

export interface CustomerProfileDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  nationality?: string;
  company?: string;
  customerRequirements?: string;
  riskLevel: RiskLevel;
  registrationDate: Date;
  lastLoginDate?: Date;
  totalBookings: number;
  totalReservations: number;
  totalSpent: number;
  preferredCurrency: string;
  isActive: boolean;
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}