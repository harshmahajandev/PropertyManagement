// Export all models
export * from './auth.model';
export * from './property.model';
export * from './customer.model';
export * from './dashboard.model';
export * from './crm.model';

// Common utility types
export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: Date;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FilterOptions {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface NotificationMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions?: string[];
}

export interface PaginatedQuery {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
}

export interface LoadingState {
  loading: boolean;
  error?: string | null;
}

export interface FormValidation {
  isValid: boolean;
  errors: { [key: string]: string };
}