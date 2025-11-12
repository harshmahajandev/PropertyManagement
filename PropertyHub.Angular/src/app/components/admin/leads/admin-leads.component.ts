import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Lead Management</h2>
              <p class="text-muted">CRM pipeline, lead scoring, and conversion tracking</p>
            </div>
            <div>
              <a routerLink="/admin" class="btn btn-outline-primary me-2">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Admin
              </a>
              <a routerLink="/dashboard" class="btn btn-outline-secondary">
                <i class="fas fa-user me-2"></i>
                Customer View
              </a>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body text-center py-5">
              <i class="fas fa-users fa-4x text-muted mb-4"></i>
              <h4>CRM Lead Management</h4>
              <p class="text-muted">Track leads, manage pipeline, and monitor conversions</p>
              <div class="alert alert-info">
                <strong>Coming Soon!</strong> CRM and lead management features will be available here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminLeadsComponent {}