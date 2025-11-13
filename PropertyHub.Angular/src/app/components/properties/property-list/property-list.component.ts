import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { PropertyService } from '../../../services/property.service';
import { Property, PropertyFilterOptions, PropertyListResponse, PropertyType, PropertyStatus, Currency } from '../../../models';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastrModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading properties...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn-close" (click)="error = ''"></button>
      </div>

      <!-- Main Content -->
      <div *ngIf="!isLoading" class="fade-in">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2>
                  <i class="fas fa-building text-primary me-2"></i>
                  Property Listings
                </h2>
                <p class="text-muted mb-0">{{ totalProperties }} properties found</p>
              </div>
              <div>
                <a routerLink="/dashboard" class="btn btn-outline-primary">
                  <i class="fas fa-arrow-left me-2"></i>
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <!-- Search Bar -->
                <div class="row mb-4">
                  <div class="col-md-8">
                    <div class="input-group">
                      <span class="input-group-text bg-white border-end-0">
                        <i class="fas fa-search text-muted"></i>
                      </span>
                      <input type="text" 
                             class="form-control border-start-0 ps-0" 
                             placeholder="Search properties by name, location, or project..."
                             [(ngModel)]="filters.searchTerm"
                             (ngModelChange)="onSearchChange($event)">
                      <button class="btn btn-outline-secondary" type="button" (click)="clearSearch()" *ngIf="filters.searchTerm">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4 text-end">
                    <button class="btn btn-primary" (click)="refreshProperties()">
                      <i class="fas fa-sync-alt me-2"></i>Refresh
                    </button>
                  </div>
                </div>

                <!-- Filter Controls -->
                <div class="row g-3">
                  <!-- Property Type -->
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Property Type</label>
                    <select class="form-select" [(ngModel)]="filters.type" (ngModelChange)="applyFilters()">
                      <option value="">All Types</option>
                      <option *ngFor="let type of propertyTypes" [value]="type">{{ type }}</option>
                    </select>
                  </div>

                  <!-- Property Status -->
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Status</label>
                    <select class="form-select" [(ngModel)]="filters.status" (ngModelChange)="applyFilters()">
                      <option value="">All Status</option>
                      <option *ngFor="let status of propertyStatuses" [value]="status">{{ status }}</option>
                    </select>
                  </div>

                  <!-- Project Filter -->
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Project</label>
                    <select class="form-select" [(ngModel)]="filters.project" (ngModelChange)="applyFilters()">
                      <option value="">All Projects</option>
                      <option *ngFor="let project of availableProjects" [value]="project">{{ project }}</option>
                    </select>
                  </div>

                  <!-- Currency -->
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Currency</label>
                    <select class="form-select" [(ngModel)]="filters.currency" (ngModelChange)="applyFilters()">
                      <option *ngFor="let currency of currencies" [value]="currency">{{ currency }}</option>
                    </select>
                  </div>
                </div>

                <!-- Price Range and Size Filters -->
                <div class="row g-3 mt-2">
                  <!-- Price Range -->
                  <div class="col-md-6">
                    <label class="form-label small text-muted">Price Range</label>
                    <div class="row g-2">
                      <div class="col-6">
                        <input type="number" 
                               class="form-control form-control-sm" 
                               placeholder="Min Price"
                               [(ngModel)]="filters.minPrice"
                               (ngModelChange)="applyFilters()">
                      </div>
                      <div class="col-6">
                        <input type="number" 
                               class="form-control form-control-sm" 
                               placeholder="Max Price"
                               [(ngModel)]="filters.maxPrice"
                               (ngModelChange)="applyFilters()">
                      </div>
                    </div>
                  </div>

                  <!-- Size Range -->
                  <div class="col-md-6">
                    <label class="form-label small text-muted">Size Range (sq ft)</label>
                    <div class="row g-2">
                      <div class="col-6">
                        <input type="number" 
                               class="form-control form-control-sm" 
                               placeholder="Min Size"
                               [(ngModel)]="filters.minSize"
                               (ngModelChange)="applyFilters()">
                      </div>
                      <div class="col-6">
                        <input type="number" 
                               class="form-control form-control-sm" 
                               placeholder="Max Size"
                               [(ngModel)]="filters.maxSize"
                               (ngModelChange)="applyFilters()">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Advanced Filters -->
                <div class="row g-3 mt-2">
                  <!-- Bedrooms -->
                  <div class="col-md-2">
                    <label class="form-label small text-muted">Bedrooms</label>
                    <select class="form-select form-select-sm" [(ngModel)]="filters.bedrooms" (ngModelChange)="applyFilters()">
                      <option value="">Any</option>
                      <option *ngFor="let num of [1,2,3,4,5,6]" [value]="num">{{ num }}+</option>
                    </select>
                  </div>

                  <!-- Bathrooms -->
                  <div class="col-md-2">
                    <label class="form-label small text-muted">Bathrooms</label>
                    <select class="form-select form-select-sm" [(ngModel)]="filters.bathrooms" (ngModelChange)="applyFilters()">
                      <option value="">Any</option>
                      <option *ngFor="let num of [1,2,3,4,5]" [value]="num">{{ num }}+</option>
                    </select>
                  </div>

                  <!-- Location -->
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Location</label>
                    <input type="text" 
                           class="form-control form-control-sm" 
                           placeholder="City or area"
                           [(ngModel)]="filters.location"
                           (ngModelChange)="applyFilters()">
                  </div>

                  <!-- Sort By -->
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Sort By</label>
                    <select class="form-select form-select-sm" [(ngModel)]="sortBy" (ngModelChange)="applySorting()">
                      <option value="createdAt_desc">Latest Added</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="size_desc">Size: Largest First</option>
                      <option value="viewCount_desc">Most Viewed</option>
                    </select>
                  </div>

                  <!-- Clear Filters -->
                  <div class="col-md-2">
                    <label class="form-label small text-muted">&nbsp;</label>
                    <button class="btn btn-outline-secondary btn-sm w-100" (click)="clearAllFilters()">
                      <i class="fas fa-undo me-1"></i>Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div class="row mb-3" *ngIf="hasActiveFilters()">
          <div class="col-12">
            <div class="d-flex flex-wrap gap-2">
              <span class="text-muted small">Active filters:</span>
              <span class="badge bg-primary" *ngIf="filters.searchTerm">
                Search: "{{ filters.searchTerm }}"
                <i class="fas fa-times ms-1 cursor-pointer" (click)="filters.searchTerm = undefined; applyFilters()"></i>
              </span>
              <span class="badge bg-info" *ngIf="filters.type">
                Type: {{ filters.type }}
                <i class="fas fa-times ms-1 cursor-pointer" (click)="filters.type = undefined; applyFilters()"></i>
              </span>
              <span class="badge bg-success" *ngIf="filters.status">
                Status: {{ filters.status }}
                <i class="fas fa-times ms-1 cursor-pointer" (click)="filters.status = undefined; applyFilters()"></i>
              </span>
              <span class="badge bg-warning" *ngIf="filters.project">
                Project: {{ filters.project }}
                <i class="fas fa-times ms-1 cursor-pointer" (click)="filters.project = undefined; applyFilters()"></i>
              </span>
              <span class="badge bg-secondary" *ngIf="filters.minPrice || filters.maxPrice">
                Price: {{ filters.minPrice | currency:filters.currency }} - {{ filters.maxPrice | currency:filters.currency }}
                <i class="fas fa-times ms-1 cursor-pointer" (click)="filters.minPrice = undefined; filters.maxPrice = undefined; applyFilters()"></i>
              </span>
            </div>
          </div>
        </div>

        <!-- Properties Grid -->
        <div class="row" *ngIf="properties.length > 0 && !isLoading">
          <div class="col-lg-4 col-md-6 mb-4" *ngFor="let property of properties">
            <div class="property-card card border-0 shadow-sm h-100">
              <!-- Property Image -->
              <div class="property-image-container position-relative">
                <img [src]="getPropertyImage(property)" 
                     class="card-img-top property-image" 
                     [alt]="property.title"
                     (error)="onImageError($event)">
                
                <!-- Status Badge -->
                <div class="position-absolute top-0 start-0 m-2">
                  <span class="badge" [class]="getStatusBadgeClass(property.status)">
                    {{ property.status }}
                  </span>
                </div>

                <!-- Type Badge -->
                <div class="position-absolute top-0 end-0 m-2">
                  <span class="badge bg-light text-dark">
                    {{ property.type }}
                  </span>
                </div>

                <!-- Engagement Stats -->
                <div class="position-absolute bottom-0 end-0 m-2">
                  <div class="d-flex gap-1">
                    <small class="badge bg-dark bg-opacity-75">
                      <i class="fas fa-eye me-1"></i>{{ property.viewCount }}
                    </small>
                    <small class="badge bg-dark bg-opacity-75">
                      <i class="fas fa-envelope me-1"></i>{{ property.inquiries }}
                    </small>
                  </div>
                </div>
              </div>

              <div class="card-body d-flex flex-column">
                <!-- Property Title and Price -->
                <div class="mb-3">
                  <h5 class="card-title mb-1">{{ property.title }}</h5>
                  <h6 class="text-primary fw-bold mb-2">
                    {{ property.price | currency:property.currency }}
                  </h6>
                  <p class="text-muted small mb-0">
                    <i class="fas fa-map-marker-alt me-1"></i>{{ property.location }}
                  </p>
                </div>

                <!-- Property Details -->
                <div class="property-details mb-3">
                  <div class="row g-2 text-center">
                    <div class="col-4">
                      <div class="detail-item">
                        <i class="fas fa-bed text-muted"></i>
                        <div class="small fw-bold">{{ property.bedrooms }}</div>
                        <div class="text-muted small">Bed</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="detail-item">
                        <i class="fas fa-bath text-muted"></i>
                        <div class="small fw-bold">{{ property.bathrooms }}</div>
                        <div class="text-muted small">Bath</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="detail-item">
                        <i class="fas fa-ruler-combined text-muted"></i>
                        <div class="small fw-bold">{{ property.size | number }}</div>
                        <div class="text-muted small">sq ft</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Project and Description -->
                <div class="mb-3">
                  <span class="badge bg-light text-dark me-2">
                    <i class="fas fa-building me-1"></i>{{ property.project }}
                  </span>
                </div>

                <p class="text-muted small mb-3 flex-grow-1" *ngIf="property.description">
                  {{ property.description | slice:0:100 }}{{ property.description.length > 100 ? '...' : '' }}
                </p>

                <!-- Action Buttons -->
                <div class="mt-auto">
                  <div class="d-grid gap-2">
                    <button class="btn btn-primary btn-sm" (click)="viewPropertyDetails(property.id)">
                      <i class="fas fa-eye me-2"></i>View Details
                    </button>
                    <div class="d-flex gap-2">
                      <button class="btn btn-outline-success btn-sm flex-fill" (click)="scheduleViewing(property.id)">
                        <i class="fas fa-calendar-plus me-1"></i>View
                      </button>
                      <button class="btn btn-outline-info btn-sm flex-fill" (click)="inquireAboutProperty(property.id)">
                        <i class="fas fa-envelope me-1"></i>Inquire
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Properties Found -->
        <div class="row" *ngIf="properties.length === 0 && !isLoading && !error">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center py-5">
                <i class="fas fa-search fa-4x text-muted mb-4"></i>
                <h4>No Properties Found</h4>
                <p class="text-muted mb-4">No properties match your current search criteria.</p>
                <button class="btn btn-primary" (click)="clearAllFilters()">
                  <i class="fas fa-undo me-2"></i>Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="row mt-4" *ngIf="totalPages > 1">
          <div class="col-12">
            <nav aria-label="Property pagination">
              <ul class="pagination justify-content-center">
                <!-- Previous -->
                <li class="page-item" [class.disabled]="currentPage === 1">
                  <a class="page-link" href="#" (click)="goToPage(currentPage - 1); $event.preventDefault()">
                    <i class="fas fa-chevron-left"></i>
                  </a>
                </li>

                <!-- Page Numbers -->
                <li class="page-item" 
                    *ngFor="let page of getPageNumbers()" 
                    [class.active]="page === currentPage">
                  <a class="page-link" href="#" (click)="goToPage(page); $event.preventDefault()">{{ page }}</a>
                </li>

                <!-- Next -->
                <li class="page-item" [class.disabled]="currentPage === totalPages">
                  <a class="page-link" href="#" (click)="goToPage(currentPage + 1); $event.preventDefault()">
                    <i class="fas fa-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>

            <!-- Page Info -->
            <div class="text-center text-muted small">
              Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalProperties) }} of {{ totalProperties }} properties
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

    .property-card {
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }

    .property-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
    }

    .property-image-container {
      height: 200px;
      overflow: hidden;
    }

    .property-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .property-card:hover .property-image {
      transform: scale(1.05);
    }

    .detail-item {
      padding: 0.5rem;
    }

    .detail-item i {
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }

    .badge {
      font-size: 0.75rem;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .form-label {
      font-weight: 500;
    }

    .page-link {
      border: none;
      color: #6c757d;
    }

    .page-link:hover {
      background-color: #e9ecef;
      color: #495057;
    }

    .page-item.active .page-link {
      background-color: #0d6efd;
      color: white;
    }

    @media (max-width: 768px) {
      .property-details .row > div {
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class PropertyListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  properties: Property[] = [];
  totalProperties = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 12;

  // UI State
  isLoading = false;
  error = '';

  // Filters and Search
  filters: PropertyFilterOptions = {
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: this.pageSize,
    offset: 0
  };

  // UI State
  sortBy = 'createdAt_desc';
  
  // Enums for template
  propertyTypes = Object.values(PropertyType);
  propertyStatuses = Object.values(PropertyStatus);
  currencies = Object.values(Currency);
  availableProjects: string[] = [];

  // Math for template
  Math = Math;

  constructor(
    private propertyService: PropertyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.loadAvailableProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Search with debouncing
  private searchSubject = new Subject<string>();
  
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  private initializeSearchDebouncing(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filters.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadProperties();
    });
  }

  // API Calls
  loadProperties(): void {
    this.isLoading = true;
    this.error = '';

    // Set pagination parameters
    this.filters.limit = this.pageSize;
    this.filters.offset = (this.currentPage - 1) * this.pageSize;

    this.propertyService.getProperties(this.filters).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: PropertyListResponse) => {
        this.properties = response.properties || [];
        this.totalProperties = response.total || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;

        if (this.properties.length === 0 && this.totalProperties === 0) {
          this.toastr.info('No properties found matching your criteria', 'Search Result');
        }
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.error = 'Failed to load properties. Please try again.';
        this.isLoading = false;
        this.toastr.error('Failed to load properties', 'Error');
      }
    });
  }

  loadAvailableProjects(): void {
    this.propertyService.getProjectStatistics().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (projects) => {
        this.availableProjects = projects.map(p => p.projectName);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        // Fallback to common projects
        this.availableProjects = [
          'Downtown Heights', 'Seaside Villas', 'Mountain View Estates', 
          'Urban Plaza', 'Garden Residences', 'Sky Tower'
        ];
      }
    });
  }

  // Filter and Search Methods
  applyFilters(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  applySorting(): void {
    const [field, order] = this.sortBy.split('_');
    this.filters.sortBy = field;
    this.filters.sortOrder = order as 'asc' | 'desc';
    this.applyFilters();
  }

  clearSearch(): void {
    this.filters.searchTerm = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.filters = {
      searchTerm: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: this.pageSize,
      offset: 0
    };
    this.sortBy = 'createdAt_desc';
    this.currentPage = 1;
    this.loadProperties();
    this.toastr.info('All filters cleared', 'Info');
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.searchTerm || 
      this.filters.type || 
      this.filters.status || 
      this.filters.project || 
      this.filters.minPrice || 
      this.filters.maxPrice ||
      this.filters.minSize ||
      this.filters.maxSize ||
      this.filters.bedrooms ||
      this.filters.bathrooms ||
      this.filters.location
    );
  }

  // Pagination Methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProperties();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Utility Methods
  getPropertyImage(property: Property): string {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    // Fallback to property type based placeholder
    return this.getPlaceholderImage(property.type);
  }

  private getPlaceholderImage(propertyType: PropertyType): string {
    const placeholders: Record<PropertyType, string> = {
      [PropertyType.Apartment]: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      [PropertyType.Villa]: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      [PropertyType.Penthouse]: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
      [PropertyType.Townhouse]: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
      [PropertyType.Studio]: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
      [PropertyType.Loft]: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
      [PropertyType.Duplex]: 'https://images.unsplash.com/photo-1600607687644-c7171b42498d?w=400&h=300&fit=crop'
    };
    return placeholders[propertyType] || placeholders[PropertyType.Apartment];
  }

  getStatusBadgeClass(status: PropertyStatus): string {
    switch (status) {
      case PropertyStatus.Available: return 'bg-success';
      case PropertyStatus.Reserved: return 'bg-warning';
      case PropertyStatus.Sold: return 'bg-danger';
      case PropertyStatus.OffMarket: return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
  }

  // Action Methods
  viewPropertyDetails(propertyId: string): void {
    // Navigate to property details
    window.location.href = `/properties/${propertyId}`;
  }

  scheduleViewing(propertyId: string): void {
    this.propertyService.recordTour(propertyId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.toastr.success('Viewing scheduled! We will contact you soon.', 'Success');
        this.loadProperties(); // Refresh to update tour count
      },
      error: (error) => {
        console.error('Error scheduling viewing:', error);
        this.toastr.error('Failed to schedule viewing. Please try again.', 'Error');
      }
    });
  }

  inquireAboutProperty(propertyId: string): void {
    this.propertyService.recordInquiry(propertyId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.toastr.success('Inquiry sent! The agent will contact you soon.', 'Success');
        this.loadProperties(); // Refresh to update inquiry count
      },
      error: (error) => {
        console.error('Error sending inquiry:', error);
        this.toastr.error('Failed to send inquiry. Please try again.', 'Error');
      }
    });
  }

  refreshProperties(): void {
    this.loadProperties();
    this.toastr.info('Properties refreshed', 'Info');
  }
}