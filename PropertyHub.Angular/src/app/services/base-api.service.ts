import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ApiResponse, FilterOptions } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected readonly apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected get<T>(endpoint: string, params?: FilterOptions): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params: httpParams });
  }

  protected getById<T>(endpoint: string, id: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}/${id}`);
  }

  protected post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data);
  }

  protected put<T>(endpoint: string, id: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}/${id}`, data);
  }

  protected patch<T>(endpoint: string, id: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}/${id}`, data);
  }

  protected delete<T>(endpoint: string, id: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}/${id}`);
  }

  protected handleResponse<T>(response: any): T {
    if (response.success !== undefined) {
      return response.data || response;
    }
    return response;
  }

  protected handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    throw error;
  }
}