import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import {
  DashboardSummaryDto,
  PropertyStatsDto,
  LeadStatsDto,
  ReservationStatsDto,
  FinancialStatsDto,
  ActivityDto,
  TopPropertyDto
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseApiService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  // Main Dashboard
  getDashboardSummary(currency?: string): Observable<DashboardSummaryDto> {
    const params = currency ? `?currency=${currency}` : '';
    return this.get<DashboardSummaryDto>(`dashboard/summary${params}`);
  }

  // Statistics
  getPropertyStats(): Observable<PropertyStatsDto> {
    return this.get<PropertyStatsDto>('dashboard/properties/stats');
  }

  getLeadStats(): Observable<LeadStatsDto> {
    return this.get<LeadStatsDto>('dashboard/leads/stats');
  }

  getReservationStats(): Observable<ReservationStatsDto> {
    return this.get<ReservationStatsDto>('dashboard/reservations/stats');
  }

  getFinancialStats(currency: string = 'USD'): Observable<FinancialStatsDto> {
    return this.get<FinancialStatsDto>(`dashboard/financial/stats?currency=${currency}`);
  }

  // Activities and Top Performers
  getRecentActivities(): Observable<ActivityDto[]> {
    return this.get<ActivityDto[]>('dashboard/activities/recent');
  }

  getTopProperties(): Observable<TopPropertyDto[]> {
    return this.get<TopPropertyDto[]>('dashboard/properties/top');
  }

  // Distribution Data
  getLeadsBySegment(): Observable<{ [key: string]: number }> {
    return this.get<{ [key: string]: number }>('dashboard/leads/by-segment');
  }

  getReservationsByStatus(): Observable<{ [key: string]: number }> {
    return this.get<{ [key: string]: number }>('dashboard/reservations/by-status');
  }
}