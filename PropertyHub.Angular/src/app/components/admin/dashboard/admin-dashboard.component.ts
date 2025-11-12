import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Admin Dashboard</h2>
              <p class="text-muted">Comprehensive property management and analytics</p>
            </div>
            <div>
              <a routerLink="/dashboard" class="btn btn-outline-primary">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Customer View
              </a>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body text-center py-5">
              <i class="fas fa-chart-line fa-4x text-muted mb-4"></i>
              <h4>Admin Analytics Dashboard</h4>
              <p class="text-muted">Property statistics, lead management, and business insights</p>
              <div class="alert alert-info">
                <strong>Coming Soon!</strong> Admin dashboard features will be available here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {}