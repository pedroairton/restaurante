import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { LoginResponse } from '../models/login.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuth().pipe(
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
      }
    })
  );
};
