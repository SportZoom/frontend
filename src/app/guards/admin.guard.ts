import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.obtenerUsuarioActual();
  
  if (usuario && usuario.es_admin) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};