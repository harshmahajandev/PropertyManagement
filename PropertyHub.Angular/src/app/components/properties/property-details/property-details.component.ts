import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Property Details</h2>
              <p class="text-muted">View property information and details</p>
            </div>
            <div>
              <a routerLink="/properties" class="btn btn-outline-primary">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Listings
              </a>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body text-center py-5">
              <i class="fas fa-home fa-4x text-muted mb-4"></i>
              <h4>Property Details Interface</h4>
              <p class="text-muted">Property ID: {{ propertyId }}</p>
              <div class="alert alert-info">
                <strong>Coming Soon!</strong> Property details, image gallery, and booking features will be available here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PropertyDetailsComponent {
  propertyId = 'Unknown';

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.propertyId = params['id'] || 'Unknown';
    });
  }
}