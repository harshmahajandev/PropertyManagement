import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import {
  CustomerDashboardDto,
  CustomerStatisticsDto,
  CustomerPreferencesDto,
  PropertyRecommendationDto,
  CustomerBookingDto,
  CustomerMessageDto,
  CustomerReservationDto,
  CreateCustomerBookingDto,
  SendCustomerMessageDto
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CustomerPortalService extends BaseApiService {
  
  constructor(protected override http: HttpClient) {
    super(http);
  }

  // Dashboard
  getDashboard(customerId: string): Observable<CustomerDashboardDto> {
    return this.get<CustomerDashboardDto>(`customerportal/dashboard/${customerId}`);
  }

  getCustomerStatistics(customerId: string): Observable<CustomerStatisticsDto> {
    return this.get<CustomerStatisticsDto>(`customerportal/statistics/${customerId}`);
  }

  // Preferences
  getPreferences(customerId: string): Observable<CustomerPreferencesDto> {
    return this.get<CustomerPreferencesDto>(`customerportal/preferences/${customerId}`);
  }

  updatePreferences(customerId: string, preferences: any): Observable<CustomerPreferencesDto> {
    return this.put<CustomerPreferencesDto>(`customerportal/preferences/${customerId}`, '', preferences);
  }

  // Property Recommendations
  getRecommendations(customerId: string, take: number = 10): Observable<PropertyRecommendationDto[]> {
    return this.get<PropertyRecommendationDto[]>(`customerportal/recommendations/${customerId}?take=${take}`);
  }

  generateRecommendations(customerId: string): Observable<any> {
    return this.post<any>(`customerportal/recommendations/${customerId}/generate`, {});
  }

  // Bookings
  getBookings(customerId: string, take?: number): Observable<CustomerBookingDto[]> {
    const params = take ? `?take=${take}` : '';
    return this.get<CustomerBookingDto[]>(`customerportal/bookings/${customerId}${params}`);
  }

  createBooking(customerId: string, booking: CreateCustomerBookingDto): Observable<CustomerBookingDto> {
    return this.post<CustomerBookingDto>(`customerportal/bookings/${customerId}`, booking);
  }

  // Messages
  getMessages(customerId: string, take?: number): Observable<CustomerMessageDto[]> {
    const params = take ? `?take=${take}` : '';
    return this.get<CustomerMessageDto[]>(`customerportal/messages/${customerId}${params}`);
  }

  sendMessage(customerId: string, message: SendCustomerMessageDto): Observable<CustomerMessageDto> {
    return this.post<CustomerMessageDto>(`customerportal/messages/${customerId}/send`, message);
  }

  markMessageAsRead(messageId: string, customerId: string): Observable<any> {
    return this.put<any>('customerportal/messages', `${messageId}/read?customerId=${customerId}`, {});
  }

  // Reservations
  getReservations(customerId: string): Observable<CustomerReservationDto[]> {
    return this.get<CustomerReservationDto[]>(`customerportal/reservations/${customerId}`);
  }

  // Health Check
  healthCheck(): Observable<any> {
    return this.get<any>('customerportal/health');
  }
}