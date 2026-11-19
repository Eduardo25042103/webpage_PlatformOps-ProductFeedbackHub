import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthResponseDto,
  CatalogDepartmentDto,
  LoginRequest,
  RegisterRequest,
  UserDto,
  UserRole,
} from '../models/auth.model';
import { DEMO_USERS } from './demo-users.data';

const TOKEN_KEY = 'opshub_access_token';
const USER_KEY = 'opshub_user_profile';

const DEFAULT_DEPARTMENTS: CatalogDepartmentDto[] = [
  { id: 1, codigo: 'SOP', nombre: 'Soporte Técnico', descripcion: 'Atención directa y diagnóstico de incidencias' },
  { id: 2, codigo: 'TI', nombre: 'TI & Desarrollo', descripcion: 'Ingeniería de software, corrección de bugs e infraestructura' },
  { id: 3, codigo: 'VENTAS', nombre: 'Ventas Corporativas', descripcion: 'Gestión de clientes comerciales y cuentas SaaS' },
  { id: 4, codigo: 'MKT', nombre: 'Marketing & Producto', descripcion: 'Roadmap, priorización comercial y changelog' },
  { id: 5, codigo: 'OPS', nombre: 'Operaciones & SRE', descripcion: 'Disponibilidad de plataforma y monitoreo' },
];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Angular Signals para reactividad fina
  readonly currentUser = signal<UserDto | null>(this.getStoredUser());
  readonly token = signal<string | null>(this.getStoredToken());
  readonly isBackendOnline = signal<boolean | null>(null);

  // Computed signals
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.token());
  readonly userRole = computed(() => this.currentUser()?.rolCodigo || null);
  readonly userDepartment = computed(
    () => this.currentUser()?.departamentoCodigo || null
  );

  constructor() {
    this.checkBackendHealth().subscribe();

    // Si ya existe un token almacenado, validar vigencia contra /auth/me
    if (this.token()) {
      this.refreshCurrentUser().subscribe({
        error: () => {
          // Token inválido o expirado en el backend
          this.clearSession();
        },
      });
    }
  }

  /**
   * Verifica la conectividad en vivo con el backend .NET 10
   */
  checkBackendHealth(): Observable<boolean> {
    const url = `${environment.apiUrl}/health`;
    return this.http.get<any>(url).pipe(
      map((res) => {
        const isReachable = res?.data?.database?.isReachable ?? true;
        this.isBackendOnline.set(true);
        return isReachable;
      }),
      catchError(() => {
        this.isBackendOnline.set(false);
        return of(false);
      })
    );
  }

  /**
   * Obtiene el catálogo público de departamentos (GET /api/v1/catalogs/departamentos)
   */
  getDepartmentsCatalog(): Observable<CatalogDepartmentDto[]> {
    const url = `${environment.apiUrl}/catalogs/departamentos`;
    return this.http.get<ApiResponse<CatalogDepartmentDto[]>>(url).pipe(
      map((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
        return DEFAULT_DEPARTMENTS;
      }),
      catchError(() => of(DEFAULT_DEPARTMENTS))
    );
  }

  /**
   * Autenticación real contra el backend en AWS / local (POST /api/v1/auth/login)
   */
  login(credentials: LoginRequest): Observable<AuthResponseDto> {
    const url = `${environment.apiUrl}/auth/login`;

    return this.http
      .post<ApiResponse<AuthResponseDto>>(url, {
        email: credentials.email.trim(),
        password: credentials.password,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Credenciales inválidas');
          }
          this.setSession(response.data.token, response.data.user);
          this.isBackendOnline.set(true);
          return response.data;
        }),
        catchError((error: HttpErrorResponse | Error) => {
          // Si el backend responde con error 400 o 401 estructurado, propagar mensaje
          if ('status' in error && error.status === 401) {
            return throwError(() => new Error('Credenciales incorrectas. Verifica tu correo y contraseña.'));
          }

          if ('status' in error && error.status === 0) {
            // Servidor backend apagado o sin red -> fallback opcional a demo
            this.isBackendOnline.set(false);
            const matchedDemo = Object.values(DEMO_USERS).find(
              (u) => u.email.toLowerCase() === credentials.email.trim().toLowerCase()
            );

            if (matchedDemo) {
              const demoRes = this.createMockSession(matchedDemo);
              return of(demoRes);
            }

            return throwError(
              () =>
                new Error(
                  `No se pudo conectar con el servidor backend en ${environment.apiUrl}. Verifique su conexión de red.`
                )
            );
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Registro de nuevo colaborador (POST /api/v1/auth/register)
   * Integra AWS Cognito y base de datos relacional MySQL (Saga Pattern)
   */
  register(request: RegisterRequest): Observable<AuthResponseDto> {
    const url = `${environment.apiUrl}/auth/register`;

    return this.http
      .post<ApiResponse<AuthResponseDto>>(url, {
        email: request.email.trim().toLowerCase(),
        password: request.password,
        nombre: request.nombre.trim(),
        apellido: request.apellido.trim(),
        telefono: request.telefono?.trim() || null,
        departamentoId: Number(request.departamentoId),
        rolId: request.rolId ? Number(request.rolId) : null,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'No se pudo completar el registro');
          }
          this.setSession(response.data.token, response.data.user);
          this.isBackendOnline.set(true);
          return response.data;
        }),
        catchError((error: HttpErrorResponse | Error) => {
          if ('status' in error && error.status === 409) {
            return throwError(() => new Error(`El correo '${request.email}' ya se encuentra registrado en el sistema.`));
          }
          if ('status' in error && error.status === 400 && 'error' in error) {
            const msg = (error as any).error?.message || 'Datos de registro inválidos. Verifica que la contraseña tenga mayúsculas y números.';
            return throwError(() => new Error(msg));
          }
          if ('status' in error && error.status === 0) {
            this.isBackendOnline.set(false);
            // Fallback simulado para testing sin backend
            return of(this.registerLocalMock(request));
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Consulta el usuario autenticado actual desde el backend (GET /api/v1/auth/me)
   */
  refreshCurrentUser(): Observable<UserDto> {
    const url = `${environment.apiUrl}/auth/me`;
    return this.http.get<ApiResponse<UserDto>>(url).pipe(
      map((res) => {
        if (res?.data) {
          this.currentUser.set(res.data);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          return res.data;
        }
        throw new Error('No se pudo verificar la sesión');
      })
    );
  }

  /**
   * Inicio de sesión rápido con un clic para cambiar de rol y evaluar permisos en pruebas
   */
  loginAsDemo(roleKey: 'dev' | 'soporte' | 'ventas' | 'marketing' | 'admin'): AuthResponseDto {
    const user = DEMO_USERS[roleKey] || DEMO_USERS['dev'];
    return this.createMockSession(user);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  hasRole(roles: UserRole[]): boolean {
    const current = this.userRole();
    if (!current) return false;
    return roles.includes(current);
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.rolCodigo === 'ADMIN') return true;
    return user.permisos.includes(permission);
  }

  getToken(): string | null {
    return this.token();
  }

  private setSession(token: string, user: UserDto): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
  }

  private createMockSession(user: UserDto): AuthResponseDto {
    const mockToken = `jwt_mock_${user.rolCodigo.toLowerCase()}_${Date.now()}`;
    const updatedUser: UserDto = {
      ...user,
      ultimoLogin: new Date().toISOString(),
    };
    this.setSession(mockToken, updatedUser);
    return { token: mockToken, user: updatedUser };
  }

  private registerLocalMock(req: RegisterRequest): AuthResponseDto {
    const depto = DEFAULT_DEPARTMENTS.find((d) => d.id === req.departamentoId) || DEFAULT_DEPARTMENTS[0];
    const roleMap: Record<string, { id: number; codigo: UserRole; nombre: string }> = {
      TI: { id: 3, codigo: 'DEV_INGENIERO', nombre: 'Ingeniero de Software / TI' },
      VENTAS: { id: 4, codigo: 'EJECUTIVO_VENTAS', nombre: 'Ejecutivo de Ventas' },
      MKT: { id: 5, codigo: 'MARKETING_LEAD', nombre: 'Líder de Producto & Marketing' },
      SOP: { id: 2, codigo: 'AGENTE_SOPORTE', nombre: 'Agente de Soporte' },
      OPS: { id: 1, codigo: 'ADMIN', nombre: 'Administrador General' },
    };

    const assignedRole = roleMap[depto.codigo] || roleMap['SOP'];

    const mockUser: UserDto = {
      id: Date.now(),
      email: req.email,
      nombre: req.nombre,
      apellido: req.apellido,
      telefono: req.telefono,
      departamentoId: depto.id,
      departamentoCodigo: depto.codigo,
      departamentoNombre: depto.nombre,
      rolId: assignedRole.id,
      rolCodigo: assignedRole.codigo,
      rolNombre: assignedRole.nombre,
      cognitoSub: `cognito-local-${Date.now()}`,
      isActive: true,
      ultimoLogin: new Date().toISOString(),
      permisos: assignedRole.codigo === 'ADMIN' ? ['*'] : ['TICKETS_VIEW', 'TICKETS_CREATE'],
    };

    const token = `jwt_token_local_${mockUser.id}`;
    this.setSession(token, mockUser);
    return { token, user: mockUser };
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): UserDto | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
