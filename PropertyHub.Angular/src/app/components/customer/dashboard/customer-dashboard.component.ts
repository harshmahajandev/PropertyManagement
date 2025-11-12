import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerPortalService } from '../../../services/customer-portal.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CustomerDashboardDto } from '../../../models';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, ToastrModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 class="mb-1">Welcome back, {{ customerName }}!</h2>
              <p class="text-muted">Here's your property management dashboard</p>
            </div>
            <div class="text-end">
              <small class="text-muted">Last updated: {{ lastUpdated | date:'medium' }}</small>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading your dashboard...</p>
          </div>

          <!-- Dashboard Content -->
          <div *ngIf="!isLoading && dashboardData" class="fade-in">
            <!-- Quick Stats Cards -->
            <div class="row mb-4">
              <div class="col-md-3 mb-3">
                <div class="card stat-card bg-primary">
                  <div class="stat-icon">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="stat-number">{{ dashboardData.totalBookings }}</div>
                  <div class="stat-label">Total Bookings</div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card stat-card bg-success">
                  <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="stat-number">{{ dashboardData.totalReservations }}</div>
                  <div class="stat-label">Active Reservations</div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card stat-card bg-info">
                  <div class="stat-icon">
                    <i class="fas fa-dollar-sign"></i>
                  </div>
                  <div class="stat-number">{{ dashboardData.totalSpent | currency:dashboardData.preferredCurrency }}</div>
                  <div class="stat-label">Total Investment</div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card stat-card bg-warning">
                  <div class="stat-icon">
                    <i class="fas fa-star"></i>
                  </div>
                  <div class="stat-number">{{ dashboardData.recommendations?.length || 0 }}</div>
                  <div class="stat-label">Recommendations</div>
                </div>
              </div>
            </div>

            <!-- Recent Activities -->
            <div class="row">
              <div class="col-lg-8 mb-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <i class="fas fa-list me-2"></i>
                      Recent Bookings
                    </h5>
                  </div>
                  <div class="card-body">
                    <div *ngIf="dashboardData.recentBookings && dashboardData.recentBookings.length > 0; else noBookings">
                      <div *ngFor="let booking of dashboardData.recentBookings" class="d-flex align-items-center p-3 border-bottom">
                        <div class="flex-shrink-0">
                          <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center">
                            <i class="fas fa-calendar text-white"></i>
                          </div>
                        </div>
                        <div class="flex-grow-1 ms-3">
                          <h6 class="mb-1">{{ booking.propertyTitle }}</h6>
                          <small class="text-muted">{{ booking.propertyLocation }}</small>
                          <br>
                          <span class="badge bg-info">{{ booking.bookingType }}</span>
                          <span class="badge ms-2" [class]="getBookingStatusClass(booking.status)">{{ booking.status }}</span>
                        </div>
                        <div class="text-end">
                          <small class="text-muted">{{ booking.scheduledDate | date:'medium' }}</small>
                        </div>
                      </div>
                    </div>
                    <ng-template #noBookings>
                      <div class="text-center py-4">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <p class="text-muted">No recent bookings found</p>
                      </div>
                    </ng-template>
                  </div>
                </div>
              </div>

              <div class="col-lg-4 mb-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <i class="fas fa-star me-2"></i>
                      AI Recommendations
                    </h5>
                  </div>
                  <div class="card-body">
                    <div *ngIf="dashboardData.recommendations && dashboardData.recommendations.length > 0; else noRecommendations">
                      <div *ngFor="let rec of dashboardData.recommendations.slice(0, 3)" class="mb-3">
                        <div class="d-flex align-items-center">
                          <div class="flex-shrink-0">
                            <div class="avatar bg-success rounded-circle d-flex align-items-center justify-content-center">
                              <i class="fas fa-home text-white"></i>
                            </div>
                          </div>
                          <div class="flex-grow-1 ms-3">
                            <h6 class="mb-1 small">{{ rec.property?.title || 'Property' }}</h6>
                            <small class="text-muted">{{ rec.property?.location || 'Location' }}</small>
                            <div class="progress mt-1" style="height: 4px;">
                              <div 
                                class="progress-bar bg-success" 
                                [style.width.%]="rec.confidenceScore * 100"
                                role="progressbar"
                              ></div>
                            </div>
                            <small class="text-muted">{{ (rec.confidenceScore * 100).toFixed(0) }}% match</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ng-template #noRecommendations>
                      <div class="text-center py-4">
                        <i class="fas fa-robot fa-3x text-muted mb-3"></i>
                        <p class="text-muted">No recommendations available</p>
                      </div>
                    </ng-template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="row">
              <div class="col-12">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">
                      <i class="fas fa-bolt me-2"></i>
                      Quick Actions
                    </h5>
                  </div>
                  <div class="card-body">
                    <div class="row text-center">
                      <div class="col-md-2 mb-3">
                        <button class="btn btn-outline-primary w-100" routerLink="/properties">
                          <i class="fas fa-search d-block mb-2"></i>
                          Browse Properties
                        </button>
                      </div>
                      <div class="col-md-2 mb-3">
                        <button class="btn btn-outline-success w-100" routerLink="/bookings">
                          <i class="fas fa-calendar-plus d-block mb-2"></i>
                          Schedule Viewing
                        </button>
                      </div>
                      <div class="col-md-2 mb-3">
                        <button class="btn btn-outline-info w-100" routerLink="/messages">
                          <i class="fas fa-envelope d-block mb-2"></i>
                          Messages
                        </button>
                      </div>
                      <div class="col-md-2 mb-3">
                        <button class="btn btn-outline-warning w-100" routerLink="/profile">
                          <i class="fas fa-user-edit d-block mb-2"></i>
                          Edit Profile
                        </button>
                      </div>
                      <div class="col-md-2 mb-3">
                        <button class="btn btn-outline-secondary w-100" (click)="refreshDashboard()">
                          <i class="fas fa-sync d-block mb-2"></i>
                          Refresh
                        </button>
                      </div>
                      <div class="col-md-2 mb-3">
                        <button class="btn btn-outline-danger w-100" (click)="logout()">
                          <i class="fas fa-sign-out-alt d-block mb-2"></i>
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="!isLoading && error" class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerDashboardComponent implements OnInit {
  dashboardData: CustomerDashboardDto | null = null;
  customerName = '';
  isLoading = true;
  error = '';
  lastUpdated = new Date();

  constructor(
    private customerPortalService: CustomerPortalService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'User information not available';
      this.isLoading = false;
      return;
    }

    this.customerName = currentUser.fullName || 'Customer';
    this.isLoading = true;
    this.error = '';

    this.customerPortalService.getDashboard(currentUser.id).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.lastUpdated = new Date();
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.error = 'Failed to load dashboard data';
        this.toastr.error('Failed to load dashboard data', 'Error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getBookingStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      case 'rescheduled': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  refreshDashboard(): void {
    this.loadDashboard();
    this.toastr.info('Dashboard refreshed', 'Info');
  }

  logout(): void {
    this.authService.logout();
    this.toastr.success('Logged out successfully', 'Success');
  }
}