import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>My Bookings</h2>
              <p class="text-muted">View and manage your property viewings and bookings</p>
            </div>
            <div>
              <a routerLink="/dashboard" class="btn btn-outline-primary">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Dashboard
              </a>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body text-center py-5">
              <i class="fas fa-calendar-check fa-4x text-muted mb-4"></i>
              <h4>Booking Management</h4>
              <p class="text-muted">View upcoming viewings, past bookings, and schedule new appointments</p>
              <div class="alert alert-info">
                <strong>Coming Soon!</strong> Booking management features will be available here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerBookingsComponent {}