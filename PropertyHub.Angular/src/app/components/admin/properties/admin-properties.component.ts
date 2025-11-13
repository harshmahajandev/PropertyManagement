import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrModule, ToastrService } from 'ngx-toastr';

import { PropertyService } from '../../../services/property.service';
import {
  Property,
  PropertyFilterOptions,
  PropertyListResponse,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyType,
  PropertyStatus,
  Currency,
  TopPropertyDto
} from '../../../models';

@Component({
  selector: 'app-admin-properties',
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
        <p class="mt-3 text-muted">Loading properties...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn-close" (click)="error = ''"></button>
      </div>

      <!-- Property Management Content -->
      <div *ngIf="!isLoading && !error" class="fade-in">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 class="mb-1">
                      <i class="fas fa-building text-primary me-2"></i>
                      Property Management
                    </h2>
                    <p class="text-muted mb-0">
                      Manage properties, add new listings, and track performance
                    </p>
                  </div>
                  <div class="text-end">
                    <a routerLink="/admin" class="btn btn-outline-primary me-2">
                      <i class="fas fa-arrow-left me-1"></i>Back to Admin
                    </a>
                    <a routerLink="/properties" class="btn btn-outline-secondary me-2">
                      <i class="fas fa-eye me-1"></i>Public View
                    </a>
                    <button class="btn btn-primary" (click)="showPropertyModal = true; isEditMode = false; resetPropertyForm()">
                      <i class="fas fa-plus me-1"></i>Add Property
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Dashboard -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-building fa-3x text-primary"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.totalProperties }}</h3>
                <p class="stat-label text-muted mb-0">Total Properties</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-check-circle fa-3x text-success"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.availableProperties }}</h3>
                <p class="stat-label text-muted mb-0">Available</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-handshake fa-3x text-info"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.reservedProperties }}</h3>
                <p class="stat-label text-muted mb-0">Reserved</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="stat-icon mb-3">
                  <i class="fas fa-dollar-sign fa-3x text-warning"></i>
                </div>
                <h3 class="stat-number mb-2">{{ stats.totalValue | number:'1.0-0' }}</h3>
                <p class="stat-label text-muted mb-0">Total Value (K)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="row g-3 align-items-end">
                  <div class="col-md-3">
                    <label class="form-label">
                      <i class="fas fa-search me-1"></i>Search Properties
                    </label>
                    <input type="text" class="form-control" 
                           [(ngModel)]="searchTerm" 
                           (keyup.enter)="searchProperties()"
                           placeholder="Search by title, location, project...">
                  </div>
                  
                  <div class="col-md-2">
                    <label class="form-label">Property Type</label>
                    <select class="form-select" [(ngModel)]="filters.type">
                      <option [ngValue]="undefined">All Types</option>
                      <option *ngFor="let type of propertyTypes" [value]="type">{{ type }}</option>
                    </select>
                  </div>
                  
                  <div class="col-md-2">
                    <label class="form-label">Status</label>
                    <select class="form-select" [(ngModel)]="filters.status">
                      <option [ngValue]="undefined">All Status</option>
                      <option *ngFor="let status of propertyStatuses" [value]="status">{{ status }}</option>
                    </select>
                  </div>
                  
                  <div class="col-md-2">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-control" 
                           [(ngModel)]="filters.location" 
                           placeholder="Location">
                  </div>
                  
                  <div class="col-md-2">
                    <label class="form-label">Project</label>
                    <input type="text" class="form-control" 
                           [(ngModel)]="filters.project" 
                           placeholder="Project">
                  </div>
                  
                  <div class="col-md-1">
                    <button class="btn btn-primary w-100" (click)="searchProperties()" title="Search">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </div>
                
                <div class="row mt-3">
                  <div class="col-md-6">
                    <div class="d-flex align-items-center">
                      <label class="form-label me-2">Sort by:</label>
                      <select class="form-select form-select-sm" style="width: auto;" [(ngModel)]="filters.sortBy">
                        <option value="createdAt">Date Created</option>
                        <option value="title">Title</option>
                        <option value="price">Price</option>
                        <option value="viewCount">Views</option>
                        <option value="inquiries">Inquiries</option>
                      </select>
                      <select class="form-select form-select-sm ms-2" style="width: auto;" [(ngModel)]="filters.sortOrder">
                        <option value="desc">Desc</option>
                        <option value="asc">Asc</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="col-md-6 text-end">
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-outline-secondary" (click)="clearFilters()">
                        <i class="fas fa-times me-1"></i>Clear Filters
                      </button>
                      <button class="btn btn-sm btn-outline-primary" (click)="loadProperties()" [disabled]="isSearching">
                        <i class="fas fa-sync-alt me-1"></i>Refresh
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="row mb-3" *ngIf="selectedProperties.length > 0">
          <div class="col-12">
            <div class="alert alert-info d-flex justify-content-between align-items-center">
              <span>
                <i class="fas fa-info-circle me-2"></i>
                {{ selectedProperties.length }} properties selected
              </span>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" (click)="bulkUpdateStatus('Available')">
                  Set Available
                </button>
                <button class="btn btn-sm btn-outline-warning" (click)="bulkUpdateStatus('Reserved')">
                  Set Reserved
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="bulkDelete()">
                  <i class="fas fa-trash me-1"></i>Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Properties Grid -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">
                    <i class="fas fa-list text-primary me-2"></i>
                    Properties ({{ totalProperties }})
                  </h5>
                  <div class="d-flex align-items-center">
                    <select class="form-select form-select-sm me-2" style="width: auto;" [(ngModel)]="filters.limit">
                      <option [value]="10">10 per page</option>
                      <option [value]="25">25 per page</option>
                      <option [value]="50">50 per page</option>
                    </select>
                    <button class="btn btn-sm btn-outline-secondary" (click)="exportProperties()">
                      <i class="fas fa-download me-1"></i>Export
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="card-body">
                <!-- No Properties State -->
                <div *ngIf="properties.length === 0" class="text-center py-5">
                  <i class="fas fa-building fa-4x text-muted mb-4"></i>
                  <h5>No properties found</h5>
                  <p class="text-muted mb-4">
                    {{ searchTerm || filters.type || filters.status ? 'No properties match your search criteria.' : 'Start by adding your first property.' }}
                  </p>
                  <button class="btn btn-primary" (click)="showPropertyModal = true; isEditMode = false; resetPropertyForm()">
                    <i class="fas fa-plus me-1"></i>Add Your First Property
                  </button>
                </div>

                <!-- Properties Table -->
                <div *ngIf="properties.length > 0" class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th width="40">
                          <input type="checkbox" class="form-check-input" 
                                 [checked]="selectedProperties.length === properties.length"
                                 (change)="toggleSelectAll($event.target.checked)">
                        </th>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Location</th>
                        <th>Views</th>
                        <th>Inquiries</th>
                        <th width="150">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let property of properties" class="property-row">
                        <td>
                          <input type="checkbox" class="form-check-input" 
                                 [checked]="selectedProperties.includes(property.id)"
                                 (change)="togglePropertySelection(property.id, $event.target.checked)">
                        </td>
                        <td>
                          <div class="property-info">
                            <div class="d-flex align-items-center">
                              <div class="property-thumbnail me-3">
                                <div class="placeholder-image">
                                  <i class="fas fa-image text-muted"></i>
                                </div>
                              </div>
                              <div>
                                <h6 class="mb-1">{{ property.title }}</h6>
                                <small class="text-muted">
                                  <i class="fas fa-project-diagram me-1"></i>{{ property.project }}
                                </small>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge bg-secondary">{{ property.type }}</span>
                        </td>
                        <td>
                          <span class="badge" [class]="getStatusBadgeClass(property.status)">
                            {{ property.status }}
                          </span>
                        </td>
                        <td>
                          <div class="price-info">
                            <strong>{{ property.price | currency:property.currency }}</strong>
                            <br>
                            <small class="text-muted">
                              {{ property.size }} sqft • {{ property.bedrooms }}BR/{{ property.bathrooms }}BA
                            </small>
                          </div>
                        </td>
                        <td>
                          <div class="location-info">
                            <i class="fas fa-map-marker-alt text-muted me-1"></i>
                            {{ property.location }}
                          </div>
                        </td>
                        <td>
                          <div class="text-center">
                            <strong>{{ property.viewCount }}</strong>
                            <br>
                            <small class="text-muted">views</small>
                          </div>
                        </td>
                        <td>
                          <div class="text-center">
                            <strong>{{ property.inquiries }}</strong>
                            <br>
                            <small class="text-muted">inquiries</small>
                          </div>
                        </td>
                        <td>
                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" 
                                    (click)="viewProperty(property)" 
                                    title="View Details">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success" 
                                    (click)="editProperty(property)" 
                                    title="Edit Property">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" 
                                    (click)="deleteProperty(property)" 
                                    title="Delete Property">
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Pagination -->
                <div *ngIf="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <small class="text-muted">
                      Showing {{ (filters.offset || 0) + 1 }} to {{ Math.min((filters.offset || 0) + (filters.limit || 10), totalProperties) }} of {{ totalProperties }} properties
                    </small>
                  </div>
                  <nav>
                    <ul class="pagination pagination-sm mb-0">
                      <li class="page-item" [class.disabled]="currentPage === 1">
                        <button class="page-link" (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1">
                          Previous
                        </button>
                      </li>
                      <li class="page-item" *ngFor="let page of getPageNumbers()" [class.active]="page === currentPage">
                        <button class="page-link" (click)="changePage(page)">{{ page }}</button>
                      </li>
                      <li class="page-item" [class.disabled]="currentPage === totalPages">
                        <button class="page-link" (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages">
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Property Modal -->
    <div class="modal fade" [class.show]="showPropertyModal" [style.display]="showPropertyModal ? 'block' : 'none'" 
         tabindex="-1" (click)="showPropertyModal = false">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-building me-2"></i>{{ isEditMode ? 'Edit Property' : 'Add New Property' }}
            </h5>
            <button type="button" class="btn-close" (click)="showPropertyModal = false"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="propertyForm">
              <div class="row g-3">
                <!-- Basic Information -->
                <div class="col-12">
                  <h6 class="text-primary border-bottom pb-2 mb-3">
                    <i class="fas fa-info-circle me-2"></i>Basic Information
                  </h6>
                </div>
                
                <div class="col-md-8">
                  <label class="form-label">Property Title *</label>
                  <input type="text" class="form-control" formControlName="title" 
                         placeholder="Enter property title">
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Project *</label>
                  <input type="text" class="form-control" formControlName="project" 
                         placeholder="Project name">
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Property Type *</label>
                  <select class="form-select" formControlName="type">
                    <option value="">Select Type</option>
                    <option *ngFor="let type of propertyTypes" [value]="type">{{ type }}</option>
                  </select>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Status *</label>
                  <select class="form-select" formControlName="status">
                    <option value="">Select Status</option>
                    <option *ngFor="let status of propertyStatuses" [value]="status">{{ status }}</option>
                  </select>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Location *</label>
                  <input type="text" class="form-control" formControlName="location" 
                         placeholder="Property location">
                </div>

                <!-- Pricing & Specifications -->
                <div class="col-12 mt-4">
                  <h6 class="text-primary border-bottom pb-2 mb-3">
                    <i class="fas fa-dollar-sign me-2"></i>Pricing & Specifications
                  </h6>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Price *</label>
                  <input type="number" class="form-control" formControlName="price" 
                         placeholder="Price amount">
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Currency *</label>
                  <select class="form-select" formControlName="currency">
                    <option value="">Select Currency</option>
                    <option *ngFor="let currency of currencies" [value]="currency">{{ currency }}</option>
                  </select>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Size (sqft) *</label>
                  <input type="number" class="form-control" formControlName="size" 
                         placeholder="Size in square feet">
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Bedrooms *</label>
                  <input type="number" class="form-control" formControlName="bedrooms" 
                         placeholder="Number of bedrooms" min="0">
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Bathrooms *</label>
                  <input type="number" class="form-control" formControlName="bathrooms" 
                         placeholder="Number of bathrooms" min="0">
                </div>

                <!-- Additional Details -->
                <div class="col-12 mt-4">
                  <h6 class="text-primary border-bottom pb-2 mb-3">
                    <i class="fas fa-plus me-2"></i>Additional Details
                  </h6>
                </div>
                
                <div class="col-12">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" formControlName="description" 
                            rows="4" placeholder="Property description..."></textarea>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Images (comma-separated URLs)</label>
                  <input type="text" class="form-control" formControlName="images" 
                         placeholder="image1.jpg, image2.jpg, ...">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Amenities (comma-separated)</label>
                  <input type="text" class="form-control" formControlName="amenities" 
                         placeholder="Pool, Gym, Parking, ...">
                </div>
                
                <div class="col-12">
                  <label class="form-label">Features (comma-separated)</label>
                  <input type="text" class="form-control" formControlName="features" 
                         placeholder="Balcony, Garden, Maids Room, ...">
                </div>

                <!-- Location Details -->
                <div class="col-12 mt-4">
                  <h6 class="text-primary border-bottom pb-2 mb-3">
                    <i class="fas fa-map-marker-alt me-2"></i>Location Details
                  </h6>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Latitude</label>
                  <input type="number" class="form-control" formControlName="latitude" 
                         placeholder="Latitude coordinate" step="any">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Longitude</label>
                  <input type="number" class="form-control" formControlName="longitude" 
                         placeholder="Longitude coordinate" step="any">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showPropertyModal = false">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" 
                    [disabled]="propertyForm.invalid || isSaving"
                    (click)="saveProperty()">
              <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ isEditMode ? 'Update Property' : 'Create Property' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade" [class.show]="showPropertyModal" 
         [style.display]="showPropertyModal ? 'block' : 'none'"></div>
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

    .property-row {
      transition: background-color 0.2s;
    }

    .property-row:hover {
      background-color: #f8f9fa;
    }

    .property-thumbnail {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      border-radius: 0.375rem;
    }

    .placeholder-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed #dee2e6;
      border-radius: 0.375rem;
    }

    .table th {
      border-top: none;
      font-weight: 600;
      color: #495057;
      background-color: #f8f9fa;
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

    .btn-check-input:checked {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }
  `]
})
export class AdminPropertiesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  properties: Property[] = [];
  selectedProperties: string[] = [];
  totalProperties = 0;
  currentPage = 1;
  totalPages = 0;
  
  // Search & Filters
  searchTerm = '';
  filters: PropertyFilterOptions = {
    limit: 10,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  
  // UI State
  isLoading = true;
  isSearching = false;
  isSaving = false;
  error = '';
  showPropertyModal = false;
  isEditMode = false;
  selectedProperty: Property | null = null;
  
  // Form
  propertyForm: FormGroup;
  
  // Enums for templates
  propertyTypes = Object.values(PropertyType);
  propertyStatuses = Object.values(PropertyStatus);
  currencies = Object.values(Currency);
  
  // Statistics
  stats = {
    totalProperties: 0,
    availableProperties: 0,
    reservedProperties: 0,
    totalValue: 0
  };

  constructor(
    private propertyService: PropertyService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProperties();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.propertyForm = this.fb.group({
      title: ['', Validators.required],
      project: ['', Validators.required],
      type: ['', Validators.required],
      status: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      currency: ['', Validators.required],
      size: [null, [Validators.required, Validators.min(0)]],
      bedrooms: [null, [Validators.required, Validators.min(0)]],
      bathrooms: [null, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      description: [''],
      images: [''],
      amenities: [''],
      features: [''],
      latitude: [null],
      longitude: [null]
    });
  }

  private loadProperties(): void {
    this.isLoading = true;
    this.isSearching = true;
    this.error = '';

    const searchFilters: PropertyFilterOptions = {
      ...this.filters,
      searchTerm: this.searchTerm || undefined
    };

    this.propertyService.getProperties(searchFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PropertyListResponse) => {
          this.properties = response.properties;
          this.totalProperties = response.total;
          this.totalPages = response.totalPages;
          this.isLoading = false;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error loading properties:', error);
          this.error = 'Failed to load properties';
          this.isLoading = false;
          this.isSearching = false;
          this.toastr.error('Failed to load properties', 'Error');
        }
      });
  }

  private loadStatistics(): void {
    this.propertyService.getTopPerformingProperties(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (properties) => {
          this.stats.totalProperties = properties.length;
          this.stats.availableProperties = properties.filter(p => p.status === PropertyStatus.Available).length;
          this.stats.reservedProperties = properties.filter(p => p.status === PropertyStatus.Reserved).length;
          this.stats.totalValue = properties.reduce((sum, p) => sum + p.price, 0) / 1000; // Convert to thousands
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
        }
      });
  }

  searchProperties(): void {
    this.filters.offset = 0;
    this.currentPage = 1;
    this.loadProperties();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      limit: 10,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.currentPage = 1;
    this.loadProperties();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.filters.offset = (page - 1) * (this.filters.limit || 10);
    this.loadProperties();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  togglePropertySelection(propertyId: string, checked: boolean): void {
    if (checked) {
      this.selectedProperties.push(propertyId);
    } else {
      this.selectedProperties = this.selectedProperties.filter(id => id !== propertyId);
    }
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedProperties = [...this.properties.map(p => p.id)];
    } else {
      this.selectedProperties = [];
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-success';
      case 'reserved': return 'bg-warning';
      case 'sold': return 'bg-primary';
      case 'offmarket': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  resetPropertyForm(): void {
    this.propertyForm.reset();
    this.selectedProperty = null;
  }

  editProperty(property: Property): void {
    this.selectedProperty = property;
    this.isEditMode = true;
    this.showPropertyModal = true;
    
    this.propertyForm.patchValue({
      title: property.title,
      project: property.project,
      type: property.type,
      status: property.status,
      price: property.price,
      currency: property.currency,
      size: property.size,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      location: property.location,
      description: property.description || '',
      images: property.images?.join(', ') || '',
      amenities: property.amenities?.join(', ') || '',
      features: property.features?.join(', ') || '',
      latitude: property.latitude || null,
      longitude: property.longitude || null
    });
  }

  viewProperty(property: Property): void {
    // Navigate to public property details view
    window.open(`/properties/${property.id}`, '_blank');
  }

  deleteProperty(property: Property): void {
    if (!confirm(`Are you sure you want to delete "${property.title}"?`)) {
      return;
    }

    this.propertyService.deleteProperty(property.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Property deleted successfully', 'Success');
          this.loadProperties();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error deleting property:', error);
          this.toastr.error('Failed to delete property', 'Error');
        }
      });
  }

  saveProperty(): void {
    if (this.propertyForm.invalid) {
      this.toastr.error('Please fill in all required fields', 'Error');
      return;
    }

    this.isSaving = true;

    const formData = this.propertyForm.value;
    const propertyData: CreatePropertyRequest = {
      ...formData,
      images: formData.images ? formData.images.split(',').map((img: string) => img.trim()) : [],
      amenities: formData.amenities ? formData.amenities.split(',').map((amenity: string) => amenity.trim()) : [],
      features: formData.features ? formData.features.split(',').map((feature: string) => feature.trim()) : []
    };

    const saveOperation = this.isEditMode && this.selectedProperty
      ? this.propertyService.updateProperty(this.selectedProperty.id, propertyData)
      : this.propertyService.createProperty(propertyData);

    saveOperation.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.showPropertyModal = false;
          this.resetPropertyForm();
          this.loadProperties();
          this.loadStatistics();
          this.toastr.success(
            this.isEditMode ? 'Property updated successfully' : 'Property created successfully', 
            'Success'
          );
        },
        error: (error) => {
          console.error('Error saving property:', error);
          this.isSaving = false;
          this.toastr.error('Failed to save property', 'Error');
        }
      });
  }

  bulkUpdateStatus(status: string): void {
    if (this.selectedProperties.length === 0) {
      this.toastr.warning('Please select properties first', 'Warning');
      return;
    }

    // TODO: Implement bulk status update API call
    this.toastr.info('Bulk update feature coming soon!', 'Info');
  }

  bulkDelete(): void {
    if (this.selectedProperties.length === 0) {
      this.toastr.warning('Please select properties first', 'Warning');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${this.selectedProperties.length} properties?`)) {
      return;
    }

    // TODO: Implement bulk delete API call
    this.toastr.info('Bulk delete feature coming soon!', 'Info');
  }

  exportProperties(): void {
    // TODO: Implement CSV/Excel export
    this.toastr.info('Export feature coming soon!', 'Info');
  }
}
