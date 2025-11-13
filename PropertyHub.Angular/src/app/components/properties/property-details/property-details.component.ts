import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { PropertyService } from '../../../services/property.service';
import { Property, TopPropertyDto, PropertyRecommendationDto } from '../../../models';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastrModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading property details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn-close" (click)="error = ''"></button>
      </div>

      <!-- Main Content -->
      <div *ngIf="!isLoading && property" class="fade-in">
        <!-- Header with Navigation -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <nav aria-label="breadcrumb">
                  <ol class="breadcrumb">
                    <li class="breadcrumb-item">
                      <a routerLink="/dashboard" class="text-decoration-none">Dashboard</a>
                    </li>
                    <li class="breadcrumb-item">
                      <a routerLink="/properties" class="text-decoration-none">Properties</a>
                    </li>
                    <li class="breadcrumb-item active">{{ property.title }}</li>
                  </ol>
                </nav>
                <h1 class="mb-1">
                  <i class="fas fa-home text-primary me-2"></i>
                  {{ property.title }}
                </h1>
                <p class="text-muted mb-0">
                  <i class="fas fa-map-marker-alt me-2"></i>{{ property.location }}
                </p>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary" (click)="goBack()">
                  <i class="fas fa-arrow-left me-2"></i>Back to Listings
                </button>
                <button class="btn btn-outline-primary" (click)="shareProperty()">
                  <i class="fas fa-share me-2"></i>Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Left Column: Images, Details, Map -->
          <div class="col-lg-8 mb-4">
            <!-- Image Gallery -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body p-0">
                <div class="main-image-container position-relative">
                  <img [src]="getCurrentImage()" 
                       class="main-image" 
                       [alt]="property.title"
                       (error)="onImageError($event)">
                  
                  <!-- Image Navigation -->
                  <button class="image-nav-btn btn btn-light btn-sm" 
                          (click)="previousImage()" 
                          *ngIf="property.images && property.images.length > 1">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button class="image-nav-btn btn btn-light btn-sm" 
                          (click)="nextImage()" 
                          *ngIf="property.images && property.images.length > 1">
                    <i class="fas fa-chevron-right"></i>
                  </button>

                  <!-- Image Counter -->
                  <div class="image-counter" *ngIf="property.images && property.images.length > 1">
                    {{ currentImageIndex + 1 }} / {{ property.images.length }}
                  </div>

                  <!-- Status Badge -->
                  <div class="status-badge position-absolute top-0 start-0 m-3">
                    <span class="badge" [class]="getStatusBadgeClass(property.status)">
                      {{ property.status }}
                    </span>
                  </div>
                </div>

                <!-- Thumbnail Gallery -->
                <div class="thumbnail-gallery p-3" *ngIf="property.images && property.images.length > 1">
                  <div class="d-flex gap-2 overflow-auto">
                    <img *ngFor="let image of property.images; let i = index" 
                         [src]="image" 
                         class="thumbnail" 
                         [class.active]="i === currentImageIndex"
                         (click)="setCurrentImage(i)"
                         [alt]="'Image ' + (i + 1)">
                  </div>
                </div>
              </div>
            </div>

            <!-- Property Details -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0">
                  <i class="fas fa-info-circle text-primary me-2"></i>
                  Property Details
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <!-- Key Specifications -->
                  <div class="col-md-6 mb-3">
                    <h6 class="fw-bold mb-3">Specifications</h6>
                    <div class="spec-grid">
                      <div class="spec-item">
                        <i class="fas fa-bed text-muted"></i>
                        <span class="ms-2">{{ property.bedrooms }} Bedrooms</span>
                      </div>
                      <div class="spec-item">
                        <i class="fas fa-bath text-muted"></i>
                        <span class="ms-2">{{ property.bathrooms }} Bathrooms</span>
                      </div>
                      <div class="spec-item">
                        <i class="fas fa-ruler-combined text-muted"></i>
                        <span class="ms-2">{{ property.size | number }} sq ft</span>
                      </div>
                      <div class="spec-item">
                        <i class="fas fa-building text-muted"></i>
                        <span class="ms-2">{{ property.type }}</span>
                      </div>
                      <div class="spec-item">
                        <i class="fas fa-map-marker-alt text-muted"></i>
                        <span class="ms-2">{{ property.location }}</span>
                      </div>
                      <div class="spec-item">
                        <i class="fas fa-project-diagram text-muted"></i>
                        <span class="ms-2">{{ property.project }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Pricing & Financial -->
                  <div class="col-md-6 mb-3">
                    <h6 class="fw-bold mb-3">Pricing Information</h6>
                    <div class="price-info">
                      <div class="current-price mb-2">
                        <span class="h4 text-primary fw-bold">
                          {{ property.price | currency:property.currency }}
                        </span>
                        <span class="text-muted ms-2">Total Price</span>
                      </div>
                      <div class="price-per-sqft">
                        <span class="fw-bold">
                          {{ (property.price / property.size) | number:'1.0-0' }} {{ property.currency }}/sq ft
                        </span>
                      </div>
                    </div>

                    <!-- Amenities & Features -->
                    <div class="mt-4" *ngIf="property.amenities && property.amenities.length > 0">
                      <h6 class="fw-bold mb-3">Amenities</h6>
                      <div class="d-flex flex-wrap gap-1">
                        <span *ngFor="let amenity of property.amenities" 
                              class="badge bg-light text-dark me-1 mb-1">
                          {{ amenity }}
                        </span>
                      </div>
                    </div>

                    <div class="mt-3" *ngIf="property.features && property.features.length > 0">
                      <h6 class="fw-bold mb-3">Features</h6>
                      <div class="d-flex flex-wrap gap-1">
                        <span *ngFor="let feature of property.features" 
                              class="badge bg-info text-white me-1 mb-1">
                          {{ feature }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Description -->
                <div class="mt-4" *ngIf="property.description">
                  <h6 class="fw-bold mb-3">Description</h6>
                  <p class="text-muted">{{ property.description }}</p>
                </div>
              </div>
            </div>

            <!-- Location Map -->
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0">
                  <i class="fas fa-map-marked-alt text-primary me-2"></i>
                  Location
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="map-container">
                  <!-- Map Placeholder -->
                  <div class="map-placeholder d-flex align-items-center justify-content-center text-center p-5">
                    <div>
                      <i class="fas fa-map-marked-alt fa-4x text-muted mb-3"></i>
                      <h6>Interactive Map</h6>
                      <p class="text-muted mb-3">Location: {{ property.location }}</p>
                      <div class="coordinates" *ngIf="property.latitude && property.longitude">
                        <small class="text-muted">
                          Coordinates: {{ property.latitude }}, {{ property.longitude }}
                        </small>
                      </div>
                      <button class="btn btn-outline-primary btn-sm mt-3" (click)="openInMaps()">
                        <i class="fas fa-external-link-alt me-2"></i>
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Actions, Lead Info, Similar Properties -->
          <div class="col-lg-4 mb-4">
            <!-- Price & Actions Card -->
            <div class="card border-0 shadow-sm mb-4 sticky-top" style="top: 2rem;">
              <div class="card-body">
                <!-- Price Display -->
                <div class="text-center mb-4">
                  <div class="h2 text-primary fw-bold mb-2">
                    {{ property.price | currency:property.currency }}
                  </div>
                  <div class="text-muted">{{ property.currency }} • {{ property.size | number }} sq ft</div>
                </div>

                <!-- Lead Indicators -->
                <div class="lead-indicators mb-4">
                  <div class="row g-2 text-center">
                    <div class="col-3">
                      <div class="indicator-item">
                        <i class="fas fa-eye text-primary"></i>
                        <div class="fw-bold">{{ property.viewCount }}</div>
                        <small class="text-muted">Views</small>
                      </div>
                    </div>
                    <div class="col-3">
                      <div class="indicator-item">
                        <i class="fas fa-envelope text-info"></i>
                        <div class="fw-bold">{{ property.inquiries }}</div>
                        <small class="text-muted">Inquiries</small>
                      </div>
                    </div>
                    <div class="col-3">
                      <div class="indicator-item">
                        <i class="fas fa-calendar-check text-success"></i>
                        <div class="fw-bold">{{ property.tours }}</div>
                        <small class="text-muted">Tours</small>
                      </div>
                    </div>
                    <div class="col-3">
                      <div class="indicator-item">
                        <i class="fas fa-handshake text-warning"></i>
                        <div class="fw-bold">{{ property.offers }}</div>
                        <small class="text-muted">Offers</small>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-grid gap-3">
                  <button class="btn btn-success btn-lg" (click)="scheduleViewing()">
                    <i class="fas fa-calendar-plus me-2"></i>
                    Schedule Viewing
                  </button>
                  <button class="btn btn-primary btn-lg" (click)="openInquiryForm()">
                    <i class="fas fa-envelope me-2"></i>
                    Send Inquiry
                  </button>
                  <button class="btn btn-outline-info" (click)="saveToFavorites()">
                    <i class="fas fa-heart me-2"></i>
                    Add to Favorites
                  </button>
                </div>

                <!-- Property Meta -->
                <div class="property-meta mt-4 pt-4 border-top">
                  <div class="small text-muted">
                    <div>Property ID: {{ property.id }}</div>
                    <div>Listed: {{ property.createdAt | date:'mediumDate' }}</div>
                    <div>Updated: {{ property.updatedAt | date:'mediumDate' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Inquiry Form Modal Content -->
            <div class="card border-0 shadow-sm" *ngIf="showInquiryForm">
              <div class="card-header bg-white py-3">
                <h6 class="mb-0">
                  <i class="fas fa-envelope text-primary me-2"></i>
                  Send Inquiry
                </h6>
              </div>
              <div class="card-body">
                <form (ngSubmit)="submitInquiry()" #inquiryForm="ngForm">
                  <div class="mb-3">
                    <label class="form-label">Your Message</label>
                    <textarea class="form-control" 
                              rows="4" 
                              [(ngModel)]="inquiry.message" 
                              name="message"
                              placeholder="I'm interested in this property. Please contact me with more details."
                              required></textarea>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Preferred Contact Method</label>
                    <select class="form-select" [(ngModel)]="inquiry.preferredContact" name="preferredContact">
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="both">Both Email & Phone</option>
                    </select>
                  </div>

                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
                      <i class="fas fa-paper-plane me-2"></i>
                      {{ isSubmitting ? 'Sending...' : 'Send Inquiry' }}
                    </button>
                    <button type="button" class="btn btn-outline-secondary" (click)="cancelInquiry()">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Similar Properties -->
            <div class="card border-0 shadow-sm" *ngIf="similarProperties.length > 0">
              <div class="card-header bg-white py-3">
                <h6 class="mb-0">
                  <i class="fas fa-thumbs-up text-primary me-2"></i>
                  Similar Properties
                </h6>
              </div>
              <div class="card-body p-0">
                <div *ngFor="let similar of similarProperties.slice(0, 3)" 
                     class="similar-property p-3 border-bottom cursor-pointer"
                     (click)="viewSimilarProperty(similar.id)">
                  <div class="d-flex">
                    <img [src]="getPropertyImage(similar)" 
                         class="similar-image me-3"
                         [alt]="similar.title"
                         (error)="onImageError($event)">
                    <div class="flex-grow-1">
                      <h6 class="mb-1">{{ similar.title }}</h6>
                      <div class="text-primary fw-bold mb-1">
                        {{ similar.price | currency:similar.currency }}
                      </div>
                      <div class="small text-muted">
                        <i class="fas fa-eye me-1"></i>{{ similar.viewCount }} views
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
  `,
  styles: [`
    .fade-in {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .main-image-container {
      position: relative;
      height: 400px;
      overflow: hidden;
    }

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      opacity: 0.8;
    }

    .image-nav-btn:first-of-type {
      left: 1rem;
    }

    .image-nav-btn:last-of-type {
      right: 1rem;
    }

    .image-counter {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
    }

    .thumbnail-gallery {
      background-color: #f8f9fa;
    }

    .thumbnail {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 0.375rem;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .thumbnail:hover, .thumbnail.active {
      opacity: 1;
      outline: 2px solid #0d6efd;
    }

    .spec-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .spec-item {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 0.375rem;
    }

    .price-info .current-price {
      text-align: center;
    }

    .lead-indicators .indicator-item {
      padding: 0.5rem;
    }

    .lead-indicators .indicator-item i {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .map-container {
      height: 300px;
    }

    .map-placeholder {
      height: 100%;
      background-color: #f8f9fa;
    }

    .similar-property {
      transition: background-color 0.2s;
    }

    .similar-property:hover {
      background-color: #f8f9fa;
    }

    .similar-image {
      width: 60px;
      height: 50px;
      object-fit: cover;
      border-radius: 0.375rem;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .breadcrumb {
      font-size: 0.875rem;
    }

    .breadcrumb-item a {
      color: #6c757d;
    }

    .breadcrumb-item.active {
      color: #495057;
      font-weight: 500;
    }

    .sticky-top {
      position: sticky;
      top: 2rem;
      z-index: 100;
    }

    @media (max-width: 768px) {
      .main-image-container {
        height: 250px;
      }
      
      .thumbnail {
        width: 60px;
        height: 45px;
      }
      
      .spec-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PropertyDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Component State
  propertyId = '';
  property: Property | null = null;
  similarProperties: TopPropertyDto[] = [];
  isLoading = false;
  error = '';

  // Image Gallery State
  currentImageIndex = 0;

  // Inquiry Form State
  showInquiryForm = false;
  isSubmitting = false;
  inquiry = {
    message: '',
    preferredContact: 'email'
  };

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.propertyId = params['id'] || '';
      if (this.propertyId) {
        this.loadPropertyDetails();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data Loading
  loadPropertyDetails(): void {
    this.isLoading = true;
    this.error = '';

    this.propertyService.getPropertyById(this.propertyId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (property) => {
        this.property = property;
        this.isLoading = false;
        this.loadSimilarProperties();
        this.propertyService.recordTour(this.propertyId).subscribe(); // Record view
      },
      error: (error) => {
        console.error('Error loading property details:', error);
        this.error = 'Failed to load property details. Please try again.';
        this.isLoading = false;
        this.toastr.error('Failed to load property details', 'Error');
      }
    });
  }

  loadSimilarProperties(): void {
    if (!this.property) return;

    this.propertyService.getTopPerformingProperties(5).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (properties) => {
        // Filter out current property and get similar ones
        this.similarProperties = properties
          .filter(p => p.id !== this.propertyId)
          .slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading similar properties:', error);
      }
    });
  }

  // Image Gallery Methods
  getCurrentImage(): string {
    if (!this.property?.images || this.property.images.length === 0) {
      return this.getPlaceholderImage();
    }
    return this.property.images[this.currentImageIndex];
  }

  setCurrentImage(index: number): void {
    if (this.property?.images && index < this.property.images.length) {
      this.currentImageIndex = index;
    }
  }

  previousImage(): void {
    if (this.property?.images && this.property.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.property.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  nextImage(): void {
    if (this.property?.images && this.property.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.property.images.length;
    }
  }

  // Utility Methods
  getPlaceholderImage(): string {
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Available': return 'bg-success';
      case 'Reserved': return 'bg-warning';
      case 'Sold': return 'bg-danger';
      case 'OffMarket': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getPropertyImage(property: any): string {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    return this.getPlaceholderImage();
  }

  onImageError(event: any): void {
    event.target.src = this.getPlaceholderImage();
  }

  // Action Methods
  goBack(): void {
    window.history.back();
  }

  shareProperty(): void {
    if (navigator.share) {
      navigator.share({
        title: this.property?.title,
        text: `Check out this property: ${this.property?.title}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.toastr.success('Property URL copied to clipboard!', 'Success');
      });
    }
  }

  openInMaps(): void {
    if (!this.property) return;
    
    const query = encodeURIComponent(this.property.location);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  }

  scheduleViewing(): void {
    if (!this.property) return;

    this.propertyService.recordTour(this.propertyId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.toastr.success('Viewing scheduled! We will contact you soon.', 'Success');
        this.loadPropertyDetails(); // Refresh to update tour count
      },
      error: (error) => {
        console.error('Error scheduling viewing:', error);
        this.toastr.error('Failed to schedule viewing. Please try again.', 'Error');
      }
    });
  }

  openInquiryForm(): void {
    this.showInquiryForm = !this.showInquiryForm;
  }

  submitInquiry(): void {
    if (!this.inquiry.message.trim()) {
      this.toastr.warning('Please enter a message', 'Warning');
      return;
    }

    this.isSubmitting = true;

    this.propertyService.recordInquiry(this.propertyId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.toastr.success('Inquiry sent! The agent will contact you soon.', 'Success');
        this.isSubmitting = false;
        this.showInquiryForm = false;
        this.inquiry = { message: '', preferredContact: 'email' };
        this.loadPropertyDetails(); // Refresh to update inquiry count
      },
      error: (error) => {
        console.error('Error sending inquiry:', error);
        this.toastr.error('Failed to send inquiry. Please try again.', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  cancelInquiry(): void {
    this.showInquiryForm = false;
    this.inquiry = { message: '', preferredContact: 'email' };
  }

  saveToFavorites(): void {
    // For now, just show success message
    // In a real implementation, this would save to user's favorites
    this.toastr.success('Property added to favorites!', 'Success');
  }

  viewSimilarProperty(propertyId: string): void {
    // Navigate to similar property details
    window.location.href = `/properties/${propertyId}`;
  }
}