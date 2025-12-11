// Customer Portal Models - Matching API DTOs
import { Property, PropertyRecommendationDto } from './property.model';

export interface CustomerRegistrationDto {
  fullName: string;
  email: string;
  phone: string;
  nationality?: string;
  company?: string;
  customerRequirements?: string;
  propertyTypes?: string[];
  locations?: string[];
  budgetMin?: number;
  budgetMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  timeline?: string;
}

export interface CustomerLoginDto {
  email: string;
}

export interface UpdateCustomerProfileDto {
  fullName?: string;
  phone?: string;
  nationality?: string;
  company?: string;
  customerRequirements?: string;
}

export interface CustomerDashboardDto {
  profile: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    nationality?: string;
    company?: string;
    customerRequirements?: string;
    riskLevel: string;
    totalReservations: number;
    activeReservations: number;
    totalBookings: number;
    unreadMessages: number;
    savedProperties: number;
  };
  preferences: CustomerPreferencesDto;
  recommendedProperties: PropertyRecommendationDto[];
  recentBookings: CustomerBookingDto[];
  recentMessages: CustomerMessageDto[];
  statistics: CustomerStatisticsDto;
}

export interface CustomerStatisticsDto {
  totalBookings: number;
  totalReservations: number;
  totalSpent: number;
  averageBookingValue: number;
  favoritePropertyType: string;
  mostVisitedLocation: string;
  registrationDate: Date;
  lastActivityDate: Date;
  conversionRate: number;
}

export interface CustomerPreferencesDto {
  id: string;
  customerId: string;
  propertyTypes: string[];
  locations: string[];
  priceRangeMin: number;
  priceRangeMax: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  features: string[];
  riskTolerance: string;
  investmentGoals: string[];
  preferredContactMethod: string;
  notificationSettings: NotificationSettingsDto;
  updatedAt: Date;
}

export interface UpdateCustomerPreferencesDto {
  propertyTypes?: string[];
  locations?: string[];
  priceRangeMin?: number;
  priceRangeMax?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  features?: string[];
  riskTolerance?: string;
  investmentGoals?: string[];
  preferredContactMethod?: string;
  notificationSettings?: NotificationSettingsDto;
}

export interface NotificationSettingsDto {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  priceAlerts: boolean;
  newPropertyAlerts: boolean;
  bookingReminders: boolean;
}

export interface CustomerBookingDto {
  id: string;
  customerId: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  bookingType: BookingType;
  status: BookingStatus;
  scheduledDate: Date;
  duration: number;
  notes?: string;
  price?: number;
  currency?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingType {
  Viewing = 'Viewing',
  Tour = 'Tour',
  Reservation = 'Reservation',
  Consultation = 'Consultation'
}

export enum BookingStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rescheduled = 'Rescheduled'
}

export interface CreateCustomerBookingDto {
  propertyId: string;
  bookingType: BookingType;
  scheduledDate: Date;
  duration?: number;
  notes?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface CustomerMessageDto {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromName: string;
  toName: string;
  subject: string;
  message: string;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
  messageType: MessageType;
}

export enum MessageType {
  Inquiry = 'Inquiry',
  Response = 'Response',
  Notification = 'Notification',
  BookingConfirmation = 'BookingConfirmation',
  SystemMessage = 'SystemMessage'
}

export interface SendCustomerMessageDto {
  toUserId: string;
  subject: string;
  message: string;
  messageType: MessageType;
}

export interface CustomerReservationDto {
  id: string;
  propertyId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: ReservationStatus;
  totalAmount: number;
  depositAmount: number;
  depositPercentage: number;
  paymentStatus: PaymentStatus;
  reservationNumber: string;
  preferredMoveDate?: Date;
  budgetRange?: string;
  holdEndDate: Date;
  holdDurationDays: number;
  confirmedDate?: Date;
  cancelledDate?: Date;
  createdAt: Date;
}

export enum ReservationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  Expired = 'Expired'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
  Refunded = 'Refunded'
}