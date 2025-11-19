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
  CustomerProfileDto,
  UpdateCustomerProfileDto,
  CustomerPreferencesDto,
  UpdateCustomerPreferencesDto,
  NotificationSettingsDto,
  RiskLevel
} from '../../../models';

@Component({
  selector: 'app-customer-profile',
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
        <p class="mt-3 text-muted">Loading your profile...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn-close" (click)="error = ''"></button>
      </div>

      <!-- Profile Management Content -->
      <div *ngIf="!isLoading && !error" class="fade-in">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 class="mb-1">
                      <i class="fas fa-user-edit text-primary me-2"></i>
                      Profile Management
                    </h2>
                    <p class="text-muted mb-0">
                      Manage your personal information, preferences, and account settings
                    </p>
                  </div>
                  <div class="text-end">
                    <a routerLink="/dashboard" class="btn btn-outline-primary me-2">
                      <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
                    </a>
                    <button class="btn btn-primary" (click)="saveAllChanges()" [disabled]="isSaving">
                      <i class="fas fa-save me-1" *ngIf="!isSaving"></i>
                      <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1" role="status"></span>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Tabs -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <ul class="nav nav-tabs card-header-tabs" id="profileTabs" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button 
                      class="nav-link" 
                      [class.active]="activeTab === 'profile'"
                      (click)="activeTab = 'profile'" 
                      type="button" 
                      role="tab">
                      <i class="fas fa-user me-2"></i>Personal Information
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button 
                      class="nav-link" 
                      [class.active]="activeTab === 'preferences'"
                      (click)="activeTab = 'preferences'" 
                      type="button" 
                      role="tab">
                      <i class="fas fa-heart me-2"></i>Property Preferences
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button 
                      class="nav-link" 
                      [class.active]="activeTab === 'requirements'"
                      (click)="activeTab = 'requirements'" 
                      type="button" 
                      role="tab">
                      <i class="fas fa-list-check me-2"></i>Requirements
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button 
                      class="nav-link" 
                      [class.active]="activeTab === 'settings'"
                      (click)="activeTab = 'settings'" 
                      type="button" 
                      role="tab">
                      <i class="fas fa-cog me-2"></i>Account Settings
                    </button>
                  </li>
                </ul>
              </div>
              
              <div class="card-body">
                <!-- Personal Information Tab -->
                <div *ngIf="activeTab === 'profile'" class="tab-pane fade show active">
                  <h5 class="mb-4">
                    <i class="fas fa-user text-primary me-2"></i>Personal Information
                  </h5>
                  
                  <form [formGroup]="profileForm" class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-user me-1"></i>Full Name *
                      </label>
                      <input type="text" class="form-control" formControlName="fullName" 
                             [class.is-invalid]="profileForm.get('fullName')?.invalid && profileForm.get('fullName')?.touched">
                      <div class="invalid-feedback" *ngIf="profileForm.get('fullName')?.invalid && profileForm.get('fullName')?.touched">
                        Full name is required
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-envelope me-1"></i>Email Address
                      </label>
                      <input type="email" class="form-control" formControlName="email" readonly>
                      <small class="text-muted">Email cannot be changed</small>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-phone me-1"></i>Phone Number
                      </label>
                      <input type="tel" class="form-control" formControlName="phone" 
                             placeholder="+1234567890">
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-flag me-1"></i>Nationality
                      </label>
                      <input type="text" class="form-control" formControlName="nationality" 
                             placeholder="Your nationality">
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-building me-1"></i>Company
                      </label>
                      <input type="text" class="form-control" formControlName="company" 
                             placeholder="Your company">
                    </div>
                    
                    <div class="col-12">
                      <label class="form-label">
                        <i class="fas fa-shield-alt me-1"></i>Risk Level
                      </label>
                      <select class="form-select" formControlName="riskLevel">
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                      </select>
                    </div>
                  </form>
                </div>

                <!-- Property Preferences Tab -->
                <div *ngIf="activeTab === 'preferences'" class="tab-pane fade show active">
                  <h5 class="mb-4">
                    <i class="fas fa-heart text-primary me-2"></i>Property Preferences
                  </h5>
                  
                  <form [formGroup]="preferencesForm" class="row g-3">
                    <!-- Property Types -->
                    <div class="col-12">
                      <label class="form-label">
                        <i class="fas fa-building me-1"></i>Property Types
                      </label>
                      <div class="row g-2">
                        <div class="col-md-3 col-sm-6" *ngFor="let type of propertyTypes">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" [id]="'type-' + type" 
                                   [checked]="preferencesForm.get('propertyTypes')?.value?.includes(type)"
                                   (change)="togglePropertyType(type, $event)">
                            <label class="form-check-label" [for]="'type-' + type">
                              {{ type }}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Price Range -->
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-dollar-sign me-1"></i>Minimum Price
                      </label>
                      <input type="number" class="form-control" formControlName="priceRangeMin" 
                             placeholder="Minimum price">
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-dollar-sign me-1"></i>Maximum Price
                      </label>
                      <input type="number" class="form-control" formControlName="priceRangeMax" 
                             placeholder="Maximum price">
                    </div>
                    
                    <!-- Currency -->
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-coins me-1"></i>Currency
                      </label>
                      <select class="form-select" formControlName="currency">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="AED">AED (د.إ)</option>
                      </select>
                    </div>
                    
                    <!-- Bedrooms & Bathrooms -->
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-bed me-1"></i>Preferred Bedrooms
                      </label>
                      <select class="form-select" formControlName="bedrooms">
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4+ Bedrooms</option>
                      </select>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label">
                        <i class="fas fa-bath me-1"></i>Preferred Bathrooms
                      </label>
                      <select class="form-select" formControlName="bathrooms">
                        <option value="1">1 Bathroom</option>
                        <option value="2">2 Bathrooms</option>
                        <option value="3">3 Bathrooms</option>
                        <option value="4">4+ Bathrooms</option>
                      </select>
                    </div>
                    
                    <!-- Locations -->
                    <div class="col-12">
                      <label class="form-label">
                        <i class="fas fa-map-marker-alt me-1"></i>Preferred Locations
                      </label>
                      <div class="row g-2">
                        <div class="col-md-4 col-sm-6" *ngFor="let location of popularLocations">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" [id]="'location-' + location" 
                                   [checked]="preferencesForm.get('locations')?.value?.includes(location)"
                                   (change)="toggleLocation(location, $event)">
                            <label class="form-check-label" [for]="'location-' + location">
                              {{ location }}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Amenities -->
                    <div class="col-12">
                      <label class="form-label">
                        <i class="fas fa-star me-1"></i>Preferred Amenities
                      </label>
                      <div class="row g-2">
                        <div class="col-md-4 col-sm-6" *ngFor="let amenity of amenities">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" [id]="'amenity-' + amenity" 
                                   [checked]="preferencesForm.get('amenities')?.value?.includes(amenity)"
                                   (change)="toggleAmenity(amenity, $event)">
                            <label class="form-check-label" [for]="'amenity-' + amenity">
                              <i class="fas fa-check-circle text-success me-1"></i>{{ amenity }}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <!-- Requirements Tab -->
                <div *ngIf="activeTab === 'requirements'" class="tab-pane fade show active">
                  <h5 class="mb-4">
                    <i class="fas fa-list-check text-primary me-2"></i>Property Requirements
                  </h5>
                  
                  <form [formGroup]="requirementsForm" class="row g-3">
                    <div class="col-12">
                      <label class="form-label">
                        <i class="fas fa-file-alt me-1"></i>Specific Requirements
                      </label>
                      <textarea class="form-control" formControlName="customerRequirements" 
                                rows="8" 
                                placeholder="Describe your specific property requirements, investment goals, timeline, or any special needs..."></textarea>
                      <small class="text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        Provide detailed information about what you're looking for to get better recommendations
                      </small>
                    </div>
                  </form>
                </div>

                <!-- Account Settings Tab -->
                <div *ngIf="activeTab === 'settings'" class="tab-pane fade show active">
                  <h5 class="mb-4">
                    <i class="fas fa-cog text-primary me-2"></i>Account Settings
                  </h5>
                  
                  <form [formGroup]="settingsForm" class="row g-3">
                    <!-- Contact Preferences -->
                    <div class="col-12">
                      <h6 class="mb-3">
                        <i class="fas fa-phone me-2"></i>Contact Preferences
                      </h6>
                      
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="form-label">Preferred Contact Method</label>
                          <select class="form-select" formControlName="preferredContactMethod">
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="sms">SMS</option>
                            <option value="whatsapp">WhatsApp</option>
                          </select>
                        </div>
                        
                        <div class="col-md-6">
                          <label class="form-label">Risk Tolerance</label>
                          <select class="form-select" formControlName="riskTolerance">
                            <option value="Conservative">Conservative</option>
                            <option value="Balanced">Balanced</option>
                            <option value="Aggressive">Aggressive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Notification Settings -->
                    <div class="col-12">
                      <h6 class="mb-3">
                        <i class="fas fa-bell me-2"></i>Notification Settings
                      </h6>
                      
                      <div class="row g-3">
                        <div class="col-md-6">
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" formControlName="emailNotifications">
                            <label class="form-check-label">
                              <i class="fas fa-envelope me-2"></i>Email Notifications
                            </label>
                          </div>
                        </div>
                        
                        <div class="col-md-6">
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" formControlName="smsNotifications">
                            <label class="form-check-label">
                              <i class="fas fa-sms me-2"></i>SMS Notifications
                            </label>
                          </div>
                        </div>
                        
                        <div class="col-md-6">
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" formControlName="pushNotifications">
                            <label class="form-check-label">
                              <i class="fas fa-mobile-alt me-2"></i>Push Notifications
                            </label>
                          </div>
                        </div>
                        
                        <div class="col-md-6">
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" formControlName="marketingEmails">
                            <label class="form-check-label">
                              <i class="fas fa-bullhorn me-2"></i>Marketing Emails
                            </label>
                          </div>
                        </div>
                        
                        <div class="col-md-6">
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" formControlName="priceAlerts">
                            <label class="form-check-label">
                              <i class="fas fa-dollar-sign me-2"></i>Price Alerts
                            </label>
                          </div>
                        </div>
                        
                        <div class="col-md-6">
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" formControlName="newPropertyAlerts">
                            <label class="form-check-label">
                              <i class="fas fa-home me-2"></i>New Property Alerts
                            </label>
                          </div>
                        </div>
                        
                        <div class="col-md-6">
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" formControlName="bookingReminders">
                            <label class="form-check-label">
                              <i class="fas fa-calendar me-2"></i>Booking Reminders
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Statistics -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-chart-line text-primary me-2"></i>Account Statistics
                </h5>
              </div>
              <div class="card-body">
                <div class="row g-4">
                  <div class="col-md-3">
                    <div class="text-center">
                      <div class="stat-icon mb-2">
                        <i class="fas fa-calendar-check fa-3x text-success"></i>
                      </div>
                      <h4 class="text-primary">{{ profileData?.totalBookings || 0 }}</h4>
                      <p class="text-muted mb-0">Total Bookings</p>
                    </div>
                  </div>
                  
                  <div class="col-md-3">
                    <div class="text-center">
                      <div class="stat-icon mb-2">
                        <i class="fas fa-clock fa-3x text-info"></i>
                      </div>
                      <h4 class="text-info">{{ profileData?.totalReservations || 0 }}</h4>
                      <p class="text-muted mb-0">Reservations</p>
                    </div>
                  </div>
                  
                  <div class="col-md-3">
                    <div class="text-center">
                      <div class="stat-icon mb-2">
                        <i class="fas fa-envelope fa-3x text-warning"></i>
                      </div>
                      <h4 class="text-warning">{{ profileData?.unreadMessages || 0 }}</h4>
                      <p class="text-muted mb-0">Unread Messages</p>
                    </div>
                  </div>
                  
                  <div class="col-md-3">
                    <div class="text-center">
                      <div class="stat-icon mb-2">
                        <i class="fas fa-heart fa-3x text-danger"></i>
                      </div>
                      <h4 class="text-danger">{{ profileData?.savedProperties || 0 }}</h4>
                      <p class="text-muted mb-0">Saved Properties</p>
                    </div>
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

    .nav-tabs .nav-link {
      border: none;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .nav-tabs .nav-link:hover {
      border-bottom-color: #dee2e6;
      background-color: transparent;
    }

    .nav-tabs .nav-link.active {
      border-bottom-color: #0d6efd;
      background-color: transparent;
      color: #0d6efd;
      font-weight: 600;
    }

    .form-check-input:checked {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }

    .form-switch .form-check-input:checked {
      background-color: #0d6efd;
    }

    .stat-icon i {
      opacity: 0.7;
    }

    .card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
    }
  `]
})
export class CustomerProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  customerId = '';
  profileData: CustomerProfileDto | null = null;
  preferencesData: CustomerPreferencesDto | null = null;
  
  activeTab = 'profile';
  isLoading = true;
  isSaving = false;
  error = '';
  
  // Forms
  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  requirementsForm!: FormGroup;
  settingsForm!: FormGroup;
  
  // Data lists
  propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Office', 'Retail'];
  popularLocations = ['Downtown', 'Marina', 'Business Bay', 'JVC', 'Arabian Ranches', 'Dubai Hills', 'JBR', 'DIFC'];
  amenities = ['Swimming Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Concierge', 'Security', 'Maid Room'];

  constructor(
    private customerPortalService: CustomerPortalService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadProfileData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Profile Form
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: [''],
      phone: [''],
      nationality: [''],
      company: [''],
      riskLevel: ['Medium']
    });

    // Preferences Form
    this.preferencesForm = this.fb.group({
      propertyTypes: [[]],
      priceRangeMin: [null],
      priceRangeMax: [null],
      currency: ['USD'],
      bedrooms: [null],
      bathrooms: [null],
      locations: [[]],
      amenities: [[]]
    });

    // Requirements Form
    this.requirementsForm = this.fb.group({
      customerRequirements: ['']
    });

    // Settings Form
    this.settingsForm = this.fb.group({
      preferredContactMethod: ['email'],
      riskTolerance: ['Balanced'],
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      marketingEmails: [false],
      priceAlerts: [true],
      newPropertyAlerts: [true],
      bookingReminders: [true]
    });
  }

  private loadProfileData(): void {
    this.isLoading = true;
    this.error = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'No authenticated user found';
      this.isLoading = false;
      return;
    }

    this.customerId = currentUser.id;

    // Load profile and preferences in parallel
    this.authService.getCustomerProfile(this.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profileData = profile;
          this.populateProfileForm(profile);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.error = 'Failed to load profile data';
          this.isLoading = false;
          this.toastr.error('Failed to load profile data', 'Error');
        }
      });

    this.customerPortalService.getPreferences(this.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preferences) => {
          this.preferencesData = preferences;
          this.populatePreferencesForm(preferences);
          this.populateSettingsForm(preferences);
        },
        error: (error) => {
          console.error('Error loading preferences:', error);
          // Non-critical error, don't block the UI
          this.toastr.warning('Failed to load preferences', 'Warning');
        }
      });
  }

  private populateProfileForm(profile: CustomerProfileDto): void {
    this.profileForm.patchValue({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      nationality: profile.nationality || '',
      company: profile.company || '',
      riskLevel: profile.riskLevel || 'Medium'
    });
  }

  private populatePreferencesForm(preferences: CustomerPreferencesDto): void {
    this.preferencesForm.patchValue({
      propertyTypes: preferences.propertyTypes || [],
      priceRangeMin: preferences.priceRangeMin || null,
      priceRangeMax: preferences.priceRangeMax || null,
      currency: preferences.currency || 'USD',
      bedrooms: preferences.bedrooms || null,
      bathrooms: preferences.bathrooms || null,
      locations: preferences.locations || [],
      amenities: preferences.amenities || []
    });
  }

  private populateSettingsForm(preferences: CustomerPreferencesDto): void {
    const notificationSettings = preferences.notificationSettings || {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
      priceAlerts: true,
      newPropertyAlerts: true,
      bookingReminders: true
    };

    this.settingsForm.patchValue({
      preferredContactMethod: preferences.preferredContactMethod || 'email',
      riskTolerance: preferences.riskTolerance || 'Balanced',
      emailNotifications: notificationSettings.emailNotifications,
      smsNotifications: notificationSettings.smsNotifications,
      pushNotifications: notificationSettings.pushNotifications,
      marketingEmails: notificationSettings.marketingEmails,
      priceAlerts: notificationSettings.priceAlerts,
      newPropertyAlerts: notificationSettings.newPropertyAlerts,
      bookingReminders: notificationSettings.bookingReminders
    });
  }

  // Form field toggles
  togglePropertyType(type: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentTypes = this.preferencesForm.get('propertyTypes')?.value || [];
    if (target.checked) {
      this.preferencesForm.patchValue({
        propertyTypes: [...currentTypes, type]
      });
    } else {
      this.preferencesForm.patchValue({
        propertyTypes: currentTypes.filter((t: string) => t !== type)
      });
    }
  }

  toggleLocation(location: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentLocations = this.preferencesForm.get('locations')?.value || [];
    if (target.checked) {
      this.preferencesForm.patchValue({
        locations: [...currentLocations, location]
      });
    } else {
      this.preferencesForm.patchValue({
        locations: currentLocations.filter((l: string) => l !== location)
      });
    }
  }

  toggleAmenity(amenity: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentAmenities = this.preferencesForm.get('amenities')?.value || [];
    if (target.checked) {
      this.preferencesForm.patchValue({
        amenities: [...currentAmenities, amenity]
      });
    } else {
      this.preferencesForm.patchValue({
        amenities: currentAmenities.filter((a: string) => a !== amenity)
      });
    }
  }

  saveAllChanges(): void {
    if (!this.customerId) {
      this.toastr.error('No customer ID found', 'Error');
      return;
    }

    this.isSaving = true;
    this.error = '';

    const profileUpdates: UpdateCustomerProfileDto = {
      fullName: this.profileForm.get('fullName')?.value,
      phone: this.profileForm.get('phone')?.value,
      nationality: this.profileForm.get('nationality')?.value,
      company: this.profileForm.get('company')?.value,
      customerRequirements: this.requirementsForm.get('customerRequirements')?.value
    };

    // Update profile first
    this.authService.updateProfile(this.customerId, profileUpdates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProfile) => {
          this.profileData = updatedProfile;
          this.toastr.success('Profile updated successfully', 'Success');
          
          // Now update preferences
          this.updatePreferences();
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.isSaving = false;
          this.error = 'Failed to update profile';
          this.toastr.error('Failed to update profile', 'Error');
        }
      });
  }

  private updatePreferences(): void {
    const preferencesUpdates: UpdateCustomerPreferencesDto = {
      ...this.preferencesForm.value,
      ...this.settingsForm.value
    };

    this.customerPortalService.updatePreferences(this.customerId, preferencesUpdates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPreferences) => {
          this.preferencesData = updatedPreferences;
          this.isSaving = false;
          this.toastr.success('All changes saved successfully!', 'Success');
        },
        error: (error) => {
          console.error('Error updating preferences:', error);
          this.isSaving = false;
          this.toastr.warning('Profile updated, but preferences failed to save', 'Partial Success');
        }
      });
  }
}
