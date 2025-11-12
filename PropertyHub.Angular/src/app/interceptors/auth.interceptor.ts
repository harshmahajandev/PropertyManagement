import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment.development';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getCustomerToken();
  
  // Clone the request and add the authorization header if token exists
  if (authToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Handle API calls by adding base URL if not present
  if (!req.url.startsWith('http') && !req.url.startsWith('/api')) {
    req = req.clone({
      url: `${environment.apiUrl}/${req.url}`
    });
  }

  return next(req);
};