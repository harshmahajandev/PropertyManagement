import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { BaseApiService } from './base-api.service';
import { CustomerProfileDto, LoginRequest, RegisterRequest } from '../models';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService {
  private readonly tokenKey = environment.customerTokenKey;
  private readonly profileKey = environment.storageKeys.customerProfile;
  
  private currentUserSubject = new BehaviorSubject<CustomerProfileDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    protected http: HttpClient,
    private router: Router
  ) {
    super(http);
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = this.getCustomerToken();
    const profile = this.getStoredProfile();
    
    if (token && profile) {
      this.currentUserSubject.next(profile);
      this.isLoggedInSubject.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<CustomerProfileDto> {
    return this.post<CustomerProfileDto>('customerportal/login', credentials).pipe(
      tap(response => {
        // Note: Assuming the API returns customer profile directly
        // If it returns a token, adjust accordingly
        this.setCustomerToken('Bearer ' + 'customer-token'); // This should come from API response
        this.setProfile(response);
        this.currentUserSubject.next(response);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  register(userData: RegisterRequest): Observable<CustomerProfileDto> {
    return this.post<CustomerProfileDto>('customerportal/register', userData).pipe(
      tap(response => {
        this.setProfile(response);
        this.currentUserSubject.next(response);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.profileKey);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getCustomerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setCustomerToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setProfile(profile: CustomerProfileDto): void {
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
  }

  private getStoredProfile(): CustomerProfileDto | null {
    const profileJson = localStorage.getItem(this.profileKey);
    return profileJson ? JSON.parse(profileJson) : null;
  }

  getCurrentUser(): CustomerProfileDto | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCustomerProfile(customerId: string): Observable<CustomerProfileDto> {
    return this.getById<CustomerProfileDto>('customerportal/profile', customerId);
  }

  updateProfile(customerId: string, data: Partial<CustomerProfileDto>): Observable<CustomerProfileDto> {
    return this.put<CustomerProfileDto>('customerportal/profile', customerId, data).pipe(
      tap(response => {
        this.setProfile(response);
        this.currentUserSubject.next(response);
      })
    );
  }

  refreshToken(): Observable<any> {
    // Implement token refresh logic if needed
    return this.post<any>('auth/refresh', {});
  }
}