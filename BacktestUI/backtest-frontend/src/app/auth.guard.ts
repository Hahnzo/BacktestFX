import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    // User is logged in so return true
    return true;
  }

  // User is not logged in so redirect to login page with the return url
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};