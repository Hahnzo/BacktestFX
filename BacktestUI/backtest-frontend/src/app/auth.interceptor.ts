import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Add auth header with JWT if user is logged in
  const token = authService.token;
  
  // Make sure this matches your actual API URL (including https)
  const isApiUrl = req.url.includes('localhost:7216');  // Update to match your actual API URL
  
  if (token && isApiUrl) {
    console.log('interceptor token:', token);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};