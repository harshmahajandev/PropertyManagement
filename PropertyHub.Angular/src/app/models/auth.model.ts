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
  fullName: string;
  email: string;
  phone?: string;
  nationality?: string;
  company?: string;
  customerRequirements?: string;
  riskLevel: RiskLevel;
  conversionDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  totalReservations: number;
  activeReservations: number;
  totalBookings: number;
  unreadMessages: number;
  savedProperties: number;
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}