import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized: Sesión expirada o token inválido
      if (error.status === 401) {
        authService.logout();
      }

      // 403 Forbidden: No tiene permisos suficientes
      if (error.status === 403) {
        console.warn('Acceso denegado: El usuario no cuenta con los privilegios requeridos.');
      }

      // Propagamos el error para que los servicios/componentes manejen códigos específicos (como 409 Conflict)
      return throwError(() => error);
    })
  );
};
