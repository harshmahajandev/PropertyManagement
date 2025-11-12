import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import {
  Property,
  PropertyFilterOptions,
  PropertyListResponse,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  TopPropertyDto,
  ProjectStatisticsDto
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PropertyService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // Property Management
  getProperties(filters: PropertyFilterOptions): Observable<PropertyListResponse> {
    return this.post<PropertyListResponse>('properties/list', filters);
  }

  getPropertyById(id: string, incrementView: boolean = true): Observable<Property> {
    const params = incrementView ? `?incrementView=true` : '';
    return this.getById<Property>('properties', `${id}${params}`);
  }

  createProperty(property: CreatePropertyRequest): Observable<any> {
    return this.post<any>('properties', property);
  }

  updateProperty(id: string, property: UpdatePropertyRequest): Observable<any> {
    return this.put<any>('properties', id, property);
  }

  deleteProperty(id: string): Observable<any> {
    return this.delete<any>('properties', id);
  }

  // Search and Discovery
  searchProperties(searchTerm: string, limit: number = 20, offset: number = 0): Observable<PropertyListResponse> {
    return this.get<PropertyListResponse>(`properties/search?searchTerm=${searchTerm}&limit=${limit}&offset=${offset}`);
  }

  getTopPerformingProperties(count: number = 10): Observable<TopPropertyDto[]> {
    return this.get<TopPropertyDto[]>(`properties/top-performers?count=${count}`);
  }

  getProjectStatistics(): Observable<ProjectStatisticsDto[]> {
    return this.get<ProjectStatisticsDto[]>(`properties/project-stats`);
  }

  // Engagement Tracking
  recordInquiry(propertyId: string): Observable<any> {
    return this.post<any>(`properties/${propertyId}/inquiry`, {});
  }

  recordTour(propertyId: string): Observable<any> {
    return this.post<any>(`properties/${propertyId}/tour`, {});
  }

  recordOffer(propertyId: string): Observable<any> {
    return this.post<any>(`properties/${propertyId}/offer`, {});
  }
}