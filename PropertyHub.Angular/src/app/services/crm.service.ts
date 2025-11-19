import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import {
  Lead,
  LeadFilterOptions,
  LeadListResponse,
  CreateLeadRequest,
  UpdateLeadRequest,
  UpdateLeadStatusRequest,
  PipelineStatsDto,
  TopLeadDto,
  ConvertLeadRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CrmService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // Lead Management
  getLeads(filters: LeadFilterOptions): Observable<LeadListResponse> {
    return this.post<LeadListResponse>('crm/leads/list', filters);
  }

  getLeadById(id: string): Observable<Lead> {
    return this.getById<Lead>('crm/leads', id);
  }

  createLead(lead: CreateLeadRequest): Observable<any> {
    return this.post<any>('crm/leads', lead);
  }

  updateLead(id: string, lead: UpdateLeadRequest): Observable<any> {
    return this.put<any>('crm/leads', id, lead);
  }

  deleteLead(id: string): Observable<any> {
    return this.delete<any>('crm/leads', id);
  }

  // Lead Status Management
  updateLeadStatus(id: string, status: UpdateLeadStatusRequest): Observable<any> {
    return this.patch<any>('crm/leads', `${id}/status`, status);
  }

  convertLead(id: string, conversionData: ConvertLeadRequest): Observable<any> {
    return this.post<any>(`crm/leads/${id}/convert`, conversionData);
  }

  // Pipeline Management
  getPipelineStats(): Observable<PipelineStatsDto> {
    return this.get<PipelineStatsDto>('crm/pipeline/stats');
  }

  getLeadsByStatus(status: string): Observable<Lead[]> {
    return this.get<Lead[]>(`crm/pipeline/${status}`);
  }

  // Analytics and Insights
  getTopLeads(count: number = 10): Observable<TopLeadDto[]> {
    return this.get<TopLeadDto[]>(`crm/leads/top?count=${count}`);
  }

  getLeadsByBuyerType(): Observable<any> {
    return this.get<any>('crm/leads/buyer-types');
  }

  calculateLeadScore(request: any): Observable<any> {
    return this.post<any>('crm/leads/calculate-score', request);
  }

  getConversionStats(): Observable<any> {
    return this.get<any>('crm/stats/conversion');
  }

  // Search
  searchLeads(searchTerm: string, limit: number = 20, offset: number = 0): Observable<LeadListResponse> {
    return this.get<LeadListResponse>(`crm/leads/search?searchTerm=${searchTerm}&limit=${limit}&offset=${offset}`);
  }

  // Lead Activities (Mock implementation - add real API endpoint if needed)
  getLeadActivities(leadId: string): Observable<any[]> {
    // For now, return empty array - implement when backend endpoint is ready
    return this.get<any[]>(`crm/leads/${leadId}/activities`);
  }

  // Lead Assignment (Mock implementation - add real API endpoint if needed)
  assignLead(leadId: string, assignedTo: string, notes?: string): Observable<any> {
    return this.post<any>(`crm/leads/${leadId}/assign`, { assignedTo, notes });
  }

  // Schedule Follow-up (Mock implementation - add real API endpoint if needed)
  scheduleFollowUp(leadId: string, followUpDate: Date, notes?: string): Observable<any> {
    return this.post<any>(`crm/leads/${leadId}/follow-up`, { followUpDate, notes });
  }

  // Lead Source Analytics (Mock implementation - add real API endpoint if needed)
  getLeadSources(): Observable<any[]> {
    return this.get<any[]>('crm/sources');
  }

  // Conversion Analytics
  getConversionAnalytics(): Observable<any> {
    return this.get<any>('crm/analytics');
  }
}