import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);    

  return authService.checkAuth().pipe(
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        console.log('Não autenticado, redirecionando para login');
        router.navigate(['/login']);
      } else {
        console.log('Autenticado');
      }
    })
  );
};
