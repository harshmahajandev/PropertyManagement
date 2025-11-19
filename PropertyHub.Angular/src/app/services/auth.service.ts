import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { BaseApiService } from './base-api.service';
import { CustomerProfileDto, LoginRequest, RegisterRequest } from '../models';
import { environment } from '../../environments/environment.development';

// Auth response interface for JWT
interface AuthResponse {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    nationality?: string;
    company?: string;
    role: string;
  };
}

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
    protected override http: HttpClient,
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

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => {
        // Store JWT token
        this.setCustomerToken(response.token);
        
        // Convert user to CustomerProfileDto format
        const profile: CustomerProfileDto = {
          id: response.user.id,
          email: response.user.email,
          fullName: response.user.fullName,
          phone: response.user.phone || '',
          nationality: response.user.nationality,
          company: response.user.company
        };
        
        this.setProfile(profile);
        this.currentUserSubject.next(profile);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  // Also support customer portal login for backwards compatibility
  loginViaCustomerPortal(credentials: LoginRequest): Observable<CustomerProfileDto> {
    return this.post<CustomerProfileDto>('customerportal/login', credentials).pipe(
      tap(response => {
        this.setProfile(response);
        this.currentUserSubject.next(response);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('auth/register', userData).pipe(
      tap(response => {
        // Store JWT token
        this.setCustomerToken(response.token);
        
        // Convert user to CustomerProfileDto format
        const profile: CustomerProfileDto = {
          id: response.user.id,
          email: response.user.email,
          fullName: response.user.fullName,
          phone: response.user.phone || '',
          nationality: response.user.nationality,
          company: response.user.company
        };
        
        this.setProfile(profile);
        this.currentUserSubject.next(profile);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  // Also support customer portal registration for backwards compatibility
  registerViaCustomerPortal(userData: RegisterRequest): Observable<CustomerProfileDto> {
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

  refreshToken(): Observable<AuthResponse> {
    const currentToken = this.getCustomerToken();
    if (!currentToken) {
      throw new Error('No token to refresh');
    }
    
    return this.post<AuthResponse>('auth/refresh', { token: currentToken }).pipe(
      tap(response => {
        this.setCustomerToken(response.token);
        
        const profile: CustomerProfileDto = {
          id: response.user.id,
          email: response.user.email,
          fullName: response.user.fullName,
          phone: response.user.phone || '',
          nationality: response.user.nationality,
          company: response.user.company
        };
        
        this.setProfile(profile);
        this.currentUserSubject.next(profile);
      })
    );
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getCustomerToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  // Get token expiration date
  getTokenExpirationDate(): Date | null {
    const token = this.getCustomerToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }
}