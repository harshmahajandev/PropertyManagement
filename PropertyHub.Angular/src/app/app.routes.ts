import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/customer/dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'properties',
    loadComponent: () => import('./components/properties/property-list/property-list.component').then(m => m.PropertyListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'properties/:id',
    loadComponent: () => import('./components/properties/property-details/property-details.component').then(m => m.PropertyDetailsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/customer/profile/customer-profile.component').then(m => m.CustomerProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'bookings',
    loadComponent: () => import('./components/customer/bookings/customer-bookings.component').then(m => m.CustomerBookingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./components/customer/messages/customer-messages.component').then(m => m.CustomerMessagesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/properties',
    loadComponent: () => import('./components/admin/properties/admin-properties.component').then(m => m.AdminPropertiesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/leads',
    loadComponent: () => import('./components/admin/leads/admin-leads.component').then(m => m.AdminLeadsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
