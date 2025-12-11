import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomerPortalService } from '../../../services/customer-portal.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CustomerDashboardDto, CustomerProfileDto } from '../../../models';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, ToastrModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading your dashboard...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn-close" (click)="error = ''"></button>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading && dashboardData" class="fade-in">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 class="mb-1">
                      <i class="fas fa-home text-primary me-2"></i>
                      Welcome back, {{ customerName }}!
                    </h2>
                    <p class="text-muted mb-0">
                      <i class="fas fa-envelope me-2"></i>{{ customerEmail }}
                    </p>
                  </div>
                  <div class="text-end">
                    <button class="btn btn-outline-primary btn-sm" (click)="refreshDashboard()">
                      <i class="fas fa-sync-alt me-1"></i>Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-calendar-check fa-3x text-primary"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.totalBookings }}</h3>
                <p class="stat-label text-muted mb-0">Total Bookings</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-clock fa-3x text-success"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.totalReservations }}</h3>
                <p class="stat-label text-muted mb-0">Reservations</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-envelope fa-3x text-info"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.unreadMessages }}</h3>
                <p class="stat-label text-muted mb-0">Unread Messages</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-star fa-3x text-warning"></i>
                </div>
                <h3 class="stat-number mb-2">{{ recommendations.length }}</h3>
                <p class="stat-label text-muted mb-0">Recommendations</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity & Recommendations -->
        <div class="row">
          <!-- Recent Bookings -->
          <div class="col-lg-6 mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0">
                  <i class="fas fa-list text-primary me-2"></i>
                  Recent Bookings
                </h5>
              </div>
              <div class="card-body">
                <div *ngIf="recentBookings.length > 0; else noBookings">
                  <div *ngFor="let booking of recentBookings" class="booking-item p-3 mb-2 border-bottom">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1">{{ booking.propertyTitle }}</h6>
                        <p class="text-muted small mb-1">
                          <i class="fas fa-map-marker-alt me-1"></i>{{ booking.propertyLocation }}
                        </p>
                        <span class="badge bg-info">{{ booking.bookingType }}</span>
                        <span class="badge ms-2" [class]="getStatusBadgeClass(booking.status)">
                          {{ booking.status }}
                        </span>
                      </div>
                      <div class="text-end">
                        <small class="text-muted">{{ booking.visitDate | date:'short' }}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <ng-template #noBookings>
                  <div class="text-center py-4 text-muted">
                    <i class="fas fa-calendar-times fa-3x mb-3"></i>
                    <p>No bookings yet</p>
                    <button class="btn btn-sm btn-primary" routerLink="/properties">
                      Browse Properties
                    </button>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>

          <!-- Property Recommendations -->
          <div class="col-lg-6 mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0">
                  <i class="fas fa-lightbulb text-warning me-2"></i>
                  Recommended Properties
                </h5>
              </div>
              <div class="card-body">
                <div *ngIf="recommendations.length > 0; else noRecommendations">
                  <div *ngFor="let rec of recommendations.slice(0, 3)" class="recommendation-item p-3 mb-2 border-bottom">
                    <div class="d-flex">
                      <div class="flex-grow-1">
                        <h6 class="mb-1">{{ rec.propertyTitle }}</h6>
                        <p class="text-muted small mb-1">
                          <i class="fas fa-map-marker-alt me-1"></i>{{ rec.location }}
                        </p>
                        <div class="d-flex align-items-center mb-2">
                          <span class="badge bg-success me-2">{{ rec.confidenceScore }}% Match</span>
                          <span class="text-primary fw-bold">{{ rec.price | currency:rec.currency }}</span>
                        </div>
                        <div class="match-reasons">
                          <small *ngFor="let reason of rec.matchReasons.slice(0, 2)" 
                                 class="badge bg-light text-dark me-1">
                            <i class="fas fa-check-circle text-success me-1"></i>{{ reason }}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <ng-template #noRecommendations>
                  <div class="text-center py-4 text-muted">
                    <i class="fas fa-magic fa-3x mb-3"></i>
                    <p>No recommendations yet</p>
                    <button class="btn btn-sm btn-warning" (click)="generateRecommendations()">
                      Generate Recommendations
                    </button>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0">
                  <i class="fas fa-bolt text-primary me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-3">
                    <button class="btn btn-outline-primary w-100" routerLink="/properties">
                      <i class="fas fa-building d-block mb-2 fa-2x"></i>
                      Browse Properties
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-success w-100" routerLink="/bookings">
                      <i class="fas fa-calendar-alt d-block mb-2 fa-2x"></i>
                      My Bookings
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-info w-100" routerLink="/messages">
                      <i class="fas fa-envelope d-block mb-2 fa-2x"></i>
                      Messages ({{ stats.unreadMessages }})
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-warning w-100" routerLink="/profile">
                      <i class="fas fa-user-edit d-block mb-2 fa-2x"></i>
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fade-in {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .stat-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
    }

    .stat-icon i {
      opacity: 0.7;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
    }

    .stat-label {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .booking-item, .recommendation-item {
      transition: background-color 0.2s;
    }

    .booking-item:hover, .recommendation-item:hover {
      background-color: #f8f9fa;
    }

    .match-reasons .badge {
      font-size: 0.75rem;
    }

    .btn {
      transition: all 0.2s;
    }

    .btn:hover {
      transform: translateY(-2px);
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  dashboardData: CustomerDashboardDto | null = null;
  customerName = 'Customer';
  customerEmail = '';
  customerId = '';
  isLoading = true;
  error = '';
  
  stats = {
    totalBookings: 0,
    totalReservations: 0,
    unreadMessages: 0,
    totalSpent: 0
  };
  
  recentBookings: any[] = [];
  recommendations: any[] = [];

  constructor(
    private customerPortalService: CustomerPortalService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeDashboard();
  }

  initializeDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser?.id) {
      this.autoRegisterAndLogin();
    } else {
      this.customerId = currentUser.id;
      this.customerName = currentUser.fullName;
      this.customerEmail = currentUser.email;
      this.loadDashboard(currentUser.id);
    }
  }

  autoRegisterAndLogin(): void {
    const demoData = {
      fullName: 'Demo Customer',
      email: 'demo@propertyhub.com',
      phone: '+1234567890'
    };

    this.customerPortalService.register(demoData).subscribe({
      next: (profile) => {
        this.handleSuccessfulAuth(profile);
        this.toastr.success('Welcome! Demo account created', 'Success');
      },
      error: (error) => {
        console.error('Registration error:', error);
        // If registration fails (customer exists), try login
        const errorMessage = error.error?.message || error.message || '';
        if (error.status === 400 || errorMessage.includes('already exists')) {
          this.customerPortalService.login({ email: demoData.email }).subscribe({
            next: (profile) => {
              this.handleSuccessfulAuth(profile);
            },
            error: () => {
              this.showFallbackDashboard();
            }
          });
        } else {
          this.showFallbackDashboard();
        }
      }
    });
  }

  handleSuccessfulAuth(profile: CustomerProfileDto): void {
    // Store profile
    localStorage.setItem('PropertyHubCustomerProfile', JSON.stringify(profile));
    
    // Update component state
    this.customerId = profile.id;
    this.customerName = profile.fullName;
    this.customerEmail = profile.email;
    
    // Load dashboard
    this.loadDashboard(profile.id);
  }

  loadDashboard(customerId: string): void {
    this.isLoading = true;
    this.error = '';

    this.customerPortalService.getDashboard(customerId).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.updateDashboardData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.showFallbackDashboard();
      }
    });
  }

  updateDashboardData(data: CustomerDashboardDto): void {
    // Update stats
    if (data.profile) {
      this.stats.totalBookings = data.profile.totalBookings || 0;
      this.stats.totalReservations = data.profile.totalReservations || 0;
      this.stats.unreadMessages = data.profile.unreadMessages || 0;
    }

    if (data.statistics) {
      this.stats.totalSpent = data.statistics.totalSpent || 0;
    }

    // Update collections
    this.recentBookings = data.recentBookings || [];
    this.recommendations = data.recommendedProperties || [];
  }

  showFallbackDashboard(): void {
    this.isLoading = false;
    this.error = '';
    
    // Show empty dashboard
    this.stats = {
      totalBookings: 0,
      totalReservations: 0,
      unreadMessages: 0,
      totalSpent: 0
    };
    
    this.recentBookings = [];
    this.recommendations = [];
    
    this.toastr.info('Dashboard initialized. Start exploring properties!', 'Welcome');
  }

  refreshDashboard(): void {
    if (this.customerId) {
      this.loadDashboard(this.customerId);
      this.toastr.info('Refreshing dashboard...', 'Info');
    } else {
      this.initializeDashboard();
    }
  }

  generateRecommendations(): void {
    if (!this.customerId) {
      this.toastr.warning('Please complete your profile first', 'Warning');
      return;
    }

    this.customerPortalService.generateRecommendations(this.customerId).subscribe({
      next: () => {
        this.toastr.success('Recommendations generated!', 'Success');
        this.loadDashboard(this.customerId);
      },
      error: () => {
        this.toastr.error('Failed to generate recommendations', 'Error');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'scheduled': case 'confirmed': return 'bg-success';
      case 'completed': return 'bg-primary';
      case 'cancelled': return 'bg-danger';
      case 'pending': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }
}
