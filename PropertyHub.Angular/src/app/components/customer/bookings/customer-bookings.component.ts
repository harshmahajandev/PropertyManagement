import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrModule, ToastrService } from 'ngx-toastr';

import { CustomerPortalService } from '../../../services/customer-portal.service';
import { AuthService } from '../../../services/auth.service';
import {
  CustomerBookingDto,
  BookingType,
  BookingStatus,
  CreateCustomerBookingDto
} from '../../../models';

interface BookingWithAction extends CustomerBookingDto {
  canModify: boolean;
  canCancel: boolean;
  isUpcoming: boolean;
  daysUntilBooking?: number;
}

@Component({
  selector: 'app-customer-bookings',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    ToastrModule,
    RouterLink
  ],
  template: `
    <div class="container-fluid py-4">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading your bookings...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn-close" (click)="error = ''"></button>
      </div>

      <!-- Bookings Management Content -->
      <div *ngIf="!isLoading && !error" class="fade-in">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 class="mb-1">
                      <i class="fas fa-calendar-check text-primary me-2"></i>
                      My Bookings
                    </h2>
                    <p class="text-muted mb-0">
                      View and manage your property viewings and bookings
                    </p>
                  </div>
                  <div class="text-end">
                    <a routerLink="/dashboard" class="btn btn-outline-primary me-2">
                      <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
                    </a>
                    <button class="btn btn-primary" (click)="showNewBookingModal = true">
                      <i class="fas fa-plus me-1"></i>New Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-clock fa-3x text-primary"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.upcomingBookings }}</h3>
                <p class="stat-label text-muted mb-0">Upcoming</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-check-circle fa-3x text-success"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.completedBookings }}</h3>
                <p class="stat-label text-muted mb-0">Completed</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-calendar-times fa-3x text-danger"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.cancelledBookings }}</h3>
                <p class="stat-label text-muted mb-0">Cancelled</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-redo fa-3x text-warning"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.rescheduledBookings }}</h3>
                <p class="stat-label text-muted mb-0">Rescheduled</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <div class="d-flex justify-content-between align-items-center">
                  <ul class="nav nav-pills mb-0" role="tablist">
                    <li class="nav-item" role="presentation">
                      <button 
                        class="nav-link" 
                        [class.active]="activeFilter === 'all'"
                        (click)="activeFilter = 'all'; filterBookings()" 
                        type="button">
                        <i class="fas fa-list me-1"></i>All Bookings
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button 
                        class="nav-link" 
                        [class.active]="activeFilter === 'upcoming'"
                        (click)="activeFilter = 'upcoming'; filterBookings()" 
                        type="button">
                        <i class="fas fa-calendar me-1"></i>Upcoming
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button 
                        class="nav-link" 
                        [class.active]="activeFilter === 'completed'"
                        (click)="activeFilter = 'completed'; filterBookings()" 
                        type="button">
                        <i class="fas fa-check me-1"></i>Completed
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button 
                        class="nav-link" 
                        [class.active]="activeFilter === 'cancelled'"
                        (click)="activeFilter = 'cancelled'; filterBookings()" 
                        type="button">
                        <i class="fas fa-times me-1"></i>Cancelled
                      </button>
                    </li>
                  </ul>
                  
                  <div class="d-flex align-items-center">
                    <select class="form-select form-select-sm me-2" style="width: auto;" [(ngModel)]="bookingSortBy">
                      <option value="date">Sort by Date</option>
                      <option value="status">Sort by Status</option>
                      <option value="property">Sort by Property</option>
                    </select>
                    <button class="btn btn-sm btn-outline-secondary" (click)="refreshBookings()">
                      <i class="fas fa-sync-alt me-1"></i>Refresh
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="card-body">
                <!-- No Bookings State -->
                <div *ngIf="filteredBookings.length === 0" class="text-center py-5">
                  <i class="fas fa-calendar-times fa-4x text-muted mb-4"></i>
                  <h5>No bookings found</h5>
                  <p class="text-muted mb-4">
                    {{ activeFilter === 'all' ? 'You haven\'t made any bookings yet.' : 'No bookings match the current filter.' }}
                  </p>
                  <button class="btn btn-primary" (click)="showNewBookingModal = true">
                    <i class="fas fa-plus me-1"></i>Schedule Your First Viewing
                  </button>
                </div>

                <!-- Bookings List -->
                <div *ngIf="filteredBookings.length > 0" class="booking-list">
                  <div *ngFor="let booking of filteredBookings" class="booking-item card mb-3 border">
                    <div class="card-body p-4">
                      <div class="row align-items-center">
                        <!-- Booking Info -->
                        <div class="col-lg-4 col-md-6 mb-3 mb-md-0">
                          <div class="d-flex align-items-start">
                            <div class="booking-icon me-3">
                              <i class="fas fa-building fa-2x text-primary"></i>
                            </div>
                            <div class="flex-grow-1">
                              <h6 class="mb-1">{{ booking.propertyTitle }}</h6>
                              <p class="text-muted small mb-2">
                                <i class="fas fa-map-marker-alt me-1"></i>{{ booking.propertyLocation }}
                              </p>
                              <div class="d-flex align-items-center">
                                <span class="badge bg-primary me-2">{{ booking.bookingType }}</span>
                                <span class="badge" [class]="getStatusBadgeClass(booking.status)">
                                  {{ booking.status }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Date & Time -->
                        <div class="col-lg-3 col-md-6 mb-3 mb-md-0">
                          <div class="booking-datetime">
                            <div class="d-flex align-items-center mb-2">
                              <i class="fas fa-calendar-alt text-primary me-2"></i>
                              <strong>{{ booking.scheduledDate | date:'MMM dd, yyyy' }}</strong>
                            </div>
                            <div class="d-flex align-items-center">
                              <i class="fas fa-clock text-primary me-2"></i>
                              <span>{{ booking.scheduledDate | date:'shortTime' }}</span>
                            </div>
                            <small class="text-muted d-block mt-1" *ngIf="booking.daysUntilBooking !== undefined">
                              {{ getDaysUntilText(booking.daysUntilBooking) }}
                            </small>
                          </div>
                        </div>
                        
                        <!-- Duration & Price -->
                        <div class="col-lg-2 col-md-6 mb-3 mb-md-0">
                          <div class="booking-details">
                            <div class="d-flex align-items-center mb-1">
                              <i class="fas fa-hourglass-half text-primary me-2"></i>
                              <span>{{ booking.duration }} min</span>
                            </div>
                            <div class="d-flex align-items-center" *ngIf="booking.price">
                              <i class="fas fa-dollar-sign text-primary me-2"></i>
                              <span>{{ booking.price | currency:booking.currency }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Actions -->
                        <div class="col-lg-3 col-md-6">
                          <div class="booking-actions text-end">
                            <div class="btn-group" role="group">
                              <button 
                                class="btn btn-sm btn-outline-primary" 
                                (click)="viewBookingDetails(booking)"
                                title="View Details">
                                <i class="fas fa-eye"></i>
                              </button>
                              <button 
                                class="btn btn-sm btn-outline-success" 
                                (click)="rescheduleBooking(booking)"
                                [disabled]="!booking.canModify"
                                title="Reschedule">
                                <i class="fas fa-calendar-plus"></i>
                              </button>
                              <button 
                                class="btn btn-sm btn-outline-warning" 
                                (click)="editBookingNotes(booking)"
                                title="Edit Notes">
                                <i class="fas fa-edit"></i>
                              </button>
                              <button 
                                class="btn btn-sm btn-outline-danger" 
                                (click)="cancelBooking(booking)"
                                [disabled]="!booking.canCancel"
                                title="Cancel Booking">
                                <i class="fas fa-times"></i>
                              </button>
                            </div>
                            <small class="text-muted d-block mt-2" *ngIf="booking.notes">
                              <i class="fas fa-sticky-note me-1"></i>Has notes
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Booking Modal -->
    <div class="modal fade" [class.show]="showNewBookingModal" [style.display]="showNewBookingModal ? 'block' : 'none'" 
         tabindex="-1" (click)="showNewBookingModal = false">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-plus me-2"></i>Schedule New Viewing
            </h5>
            <button type="button" class="btn-close" (click)="showNewBookingModal = false"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="newBookingForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Property ID *</label>
                  <input type="text" class="form-control" formControlName="propertyId" 
                         placeholder="Enter property ID">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Booking Type *</label>
                  <select class="form-select" formControlName="bookingType">
                    <option value="Viewing">Viewing</option>
                    <option value="Tour">Tour</option>
                    <option value="Reservation">Reservation</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Date & Time *</label>
                  <input type="datetime-local" class="form-control" formControlName="scheduledDate">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Duration (minutes)</label>
                  <input type="number" class="form-control" formControlName="duration" 
                         placeholder="30" min="15" max="240">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Contact Phone</label>
                  <input type="tel" class="form-control" formControlName="contactPhone">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Contact Email</label>
                  <input type="email" class="form-control" formControlName="contactEmail">
                </div>
                
                <div class="col-12">
                  <label class="form-label">Notes</label>
                  <textarea class="form-control" formControlName="notes" rows="3" 
                            placeholder="Any specific requirements or notes..."></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showNewBookingModal = false">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" 
                    [disabled]="newBookingForm.invalid || isCreatingBooking"
                    (click)="createNewBooking()">
              <span *ngIf="isCreatingBooking" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Schedule Viewing
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Booking Details Modal -->
    <div class="modal fade" [class.show]="showDetailsModal" [style.display]="showDetailsModal ? 'block' : 'none'" 
         tabindex="-1" (click)="showDetailsModal = false">
      <div class="modal-dialog">
        <div class="modal-content" *ngIf="selectedBooking">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>Booking Details
            </h5>
            <button type="button" class="btn-close" (click)="showDetailsModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="booking-detail-content">
              <div class="row g-3">
                <div class="col-12">
                  <h6 class="text-primary">{{ selectedBooking.propertyTitle }}</h6>
                  <p class="text-muted">
                    <i class="fas fa-map-marker-alt me-1"></i>{{ selectedBooking.propertyLocation }}
                  </p>
                </div>
                
                <div class="col-6">
                  <label class="form-label small fw-bold">Status</label>
                  <div>
                    <span class="badge" [class]="getStatusBadgeClass(selectedBooking.status)">
                      {{ selectedBooking.status }}
                    </span>
                  </div>
                </div>
                
                <div class="col-6">
                  <label class="form-label small fw-bold">Type</label>
                  <div>
                    <span class="badge bg-info">{{ selectedBooking.bookingType }}</span>
                  </div>
                </div>
                
                <div class="col-12">
                  <label class="form-label small fw-bold">Date & Time</label>
                  <div>{{ selectedBooking.scheduledDate | date:'full' }}</div>
                </div>
                
                <div class="col-6">
                  <label class="form-label small fw-bold">Duration</label>
                  <div>{{ selectedBooking.duration }} minutes</div>
                </div>
                
                <div class="col-6" *ngIf="selectedBooking.price">
                  <label class="form-label small fw-bold">Price</label>
                  <div>{{ selectedBooking.price | currency:selectedBooking.currency }}</div>
                </div>
                
                <div class="col-6" *ngIf="selectedBooking.contactPhone">
                  <label class="form-label small fw-bold">Contact Phone</label>
                  <div>{{ selectedBooking.contactPhone }}</div>
                </div>
                
                <div class="col-6" *ngIf="selectedBooking.contactEmail">
                  <label class="form-label small fw-bold">Contact Email</label>
                  <div>{{ selectedBooking.contactEmail }}</div>
                </div>
                
                <div class="col-12" *ngIf="selectedBooking.notes">
                  <label class="form-label small fw-bold">Notes</label>
                  <div class="border p-3 rounded bg-light">{{ selectedBooking.notes }}</div>
                </div>
                
                <div class="col-6">
                  <label class="form-label small fw-bold">Created</label>
                  <div>{{ selectedBooking.createdAt | date:'short' }}</div>
                </div>
                
                <div class="col-6">
                  <label class="form-label small fw-bold">Updated</label>
                  <div>{{ selectedBooking.updatedAt | date:'short' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade" [class.show]="showNewBookingModal || showDetailsModal" 
         [style.display]="(showNewBookingModal || showDetailsModal) ? 'block' : 'none'"></div>
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

    .nav-pills .nav-link {
      border-radius: 0.375rem;
      transition: all 0.2s;
    }

    .nav-pills .nav-link.active {
      background-color: #0d6efd;
      color: white;
    }

    .booking-item {
      transition: all 0.2s;
      border: 1px solid #dee2e6 !important;
    }

    .booking-item:hover {
      border-color: #0d6efd !important;
      box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075) !important;
    }

    .booking-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(13, 110, 253, 0.1);
      border-radius: 0.5rem;
    }

    .btn-group .btn {
      padding: 0.375rem 0.5rem;
    }

    .modal.show {
      display: block !important;
    }

    .modal-backdrop.show {
      display: block !important;
    }

    .booking-detail-content label {
      color: #6c757d;
    }
  `]
})
export class CustomerBookingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  customerId = '';
  bookings: BookingWithAction[] = [];
  filteredBookings: BookingWithAction[] = [];
  
  activeFilter = 'all';
  bookingSortBy = 'date';
  isLoading = true;
  isCreatingBooking = false;
  error = '';
  
  // Modals
  showNewBookingModal = false;
  showDetailsModal = false;
  selectedBooking: BookingWithAction | null = null;
  
  // Stats
  stats = {
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    rescheduledBookings: 0
  };
  
  // Forms
  newBookingForm!: FormGroup;

  constructor(
    private customerPortalService: CustomerPortalService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.newBookingForm = this.fb.group({
      propertyId: ['', Validators.required],
      bookingType: ['Viewing', Validators.required],
      scheduledDate: ['', Validators.required],
      duration: [30, [Validators.min(15), Validators.max(240)]],
      contactPhone: [''],
      contactEmail: [''],
      notes: ['']
    });
  }

  private loadBookings(): void {
    this.isLoading = true;
    this.error = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'No authenticated user found';
      this.isLoading = false;
      return;
    }

    this.customerId = currentUser.id;

    this.customerPortalService.getBookings(this.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.bookings = this.enrichBookingsWithActions(bookings);
          this.calculateStats();
          this.filterBookings();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.error = 'Failed to load bookings';
          this.isLoading = false;
          this.toastr.error('Failed to load bookings', 'Error');
        }
      });
  }

  private enrichBookingsWithActions(bookings: CustomerBookingDto[]): BookingWithAction[] {
    const now = new Date();
    
    return bookings.map(booking => {
      const scheduledDate = new Date(booking.scheduledDate);
      const daysUntilBooking = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isUpcoming = scheduledDate > now;
      
      return {
        ...booking,
        canModify: isUpcoming && (booking.status === BookingStatus.Scheduled),
        canCancel: isUpcoming && (booking.status === BookingStatus.Scheduled),
        isUpcoming,
        daysUntilBooking
      };
    });
  }

  private calculateStats(): void {
    this.stats = {
      upcomingBookings: this.bookings.filter(b => b.isUpcoming && b.status === BookingStatus.Scheduled).length,
      completedBookings: this.bookings.filter(b => b.status === BookingStatus.Completed).length,
      cancelledBookings: this.bookings.filter(b => b.status === BookingStatus.Cancelled).length,
      rescheduledBookings: this.bookings.filter(b => b.status === BookingStatus.Rescheduled).length
    };
  }

  filterBookings(): void {
    let filtered = [...this.bookings];
    
    // Apply status filter
    switch (this.activeFilter) {
      case 'upcoming':
        filtered = filtered.filter(b => b.isUpcoming && b.status === BookingStatus.Scheduled);
        break;
      case 'completed':
        filtered = filtered.filter(b => b.status === BookingStatus.Completed);
        break;
      case 'cancelled':
        filtered = filtered.filter(b => b.status === BookingStatus.Cancelled);
        break;
      // 'all' shows all bookings
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.bookingSortBy) {
        case 'date':
          return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'property':
          return a.propertyTitle.localeCompare(b.propertyTitle);
        default:
          return 0;
      }
    });
    
    this.filteredBookings = filtered;
  }

  refreshBookings(): void {
    this.loadBookings();
    this.toastr.info('Refreshing bookings...', 'Info');
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-success';
      case 'completed': return 'bg-primary';
      case 'cancelled': return 'bg-danger';
      case 'rescheduled': return 'bg-warning';
      case 'pending': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getDaysUntilText(days: number): string {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days > 0) return `In ${days} days`;
    return `${Math.abs(days)} days ago`;
  }

  viewBookingDetails(booking: BookingWithAction): void {
    this.selectedBooking = booking;
    this.showDetailsModal = true;
  }

  rescheduleBooking(booking: BookingWithAction): void {
    // TODO: Implement reschedule functionality
    this.toastr.info('Reschedule feature coming soon!', 'Info');
  }

  editBookingNotes(booking: BookingWithAction): void {
    // TODO: Implement notes editing
    this.toastr.info('Notes editing feature coming soon!', 'Info');
  }

  cancelBooking(booking: BookingWithAction): void {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    // TODO: Implement cancel booking functionality
    this.toastr.info('Cancel booking feature coming soon!', 'Info');
  }

  createNewBooking(): void {
    if (this.newBookingForm.invalid) {
      this.toastr.error('Please fill in all required fields', 'Error');
      return;
    }

    this.isCreatingBooking = true;

    const bookingData: CreateCustomerBookingDto = {
      ...this.newBookingForm.value,
      scheduledDate: new Date(this.newBookingForm.value.scheduledDate)
    };

    this.customerPortalService.createBooking(this.customerId, bookingData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newBooking) => {
          this.isCreatingBooking = false;
          this.showNewBookingModal = false;
          this.newBookingForm.reset();
          
          // Refresh bookings to show the new one
          this.loadBookings();
          this.toastr.success('Booking scheduled successfully!', 'Success');
        },
        error: (error) => {
          console.error('Error creating booking:', error);
          this.isCreatingBooking = false;
          this.toastr.error('Failed to create booking', 'Error');
        }
      });
  }
}
