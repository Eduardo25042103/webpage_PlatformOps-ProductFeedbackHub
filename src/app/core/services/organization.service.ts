import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  CreateDepartmentRequest,
  CreateInternalUserRequest,
  DepartmentSummary,
  InternalUser,
  RoleWithPermissions,
} from '../models/organization.model';
import { environment } from '../../../environments/environment';

const USERS_STORAGE_KEY = 'opshub_internal_users_data';
const DEPTS_STORAGE_KEY = 'opshub_departments_data';

const INITIAL_DEPARTMENTS: DepartmentSummary[] = [
  {
    id: 1,
    codigo: 'SOPORTE',
    nombre: 'TI y Soporte Técnico',
    descripcion: 'Atención a incidentes N1/N2, diagnóstico de facturación electrónica y cumplimiento de SLAs.',
    isActive: true,
    totalUsuarios: 2,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 2,
    codigo: 'DEV',
    nombre: 'Ingeniería y Desarrollo',
    descripcion: 'Desarrollo de microservicios, parches de código, arquitectura AWS Lambda y corrección de bugs.',
    isActive: true,
    totalUsuarios: 2,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 3,
    codigo: 'VENTAS',
    nombre: 'Comercial y Cuentas SaaS',
    descripcion: 'Gestión de cartera de clientes corporativos, prevención de Churn y fidelización ARR.',
    isActive: true,
    totalUsuarios: 1,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 4,
    codigo: 'MKT',
    nombre: 'Producto y Marketing',
    descripcion: 'Roadmap de funcionalidades, gestión de sugerencias, releases y matriz RICE.',
    isActive: true,
    totalUsuarios: 1,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 5,
    codigo: 'DIR',
    nombre: 'Dirección General & Operaciones',
    descripcion: 'Supervisión ejecutiva, políticas de acceso, gobernanza y auditoría general.',
    isActive: true,
    totalUsuarios: 1,
    createdAt: '2026-01-10T08:00:00Z',
  },
];

const INITIAL_USERS: InternalUser[] = [
  {
    id: 1,
    email: 'admin@tunegocio.pe',
    nombre: 'Administrador',
    apellido: 'General',
    telefono: '+51 987 000 001',
    departamentoId: 5,
    departamentoCodigo: 'DIR',
    departamentoNombre: 'Dirección General & Operaciones',
    rolId: 1,
    rolCodigo: 'ADMIN',
    rolNombre: 'Administrador General',
    isActive: true,
    ultimoLogin: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    createdAt: '2026-01-10T09:00:00Z',
    permisos: ['*'],
  },
  {
    id: 2,
    email: 'aldair.cahuana@tunegocio.pe',
    nombre: 'Aldair',
    apellido: 'Cahuana',
    telefono: '+51 987 111 222',
    departamentoId: 2,
    departamentoCodigo: 'DEV',
    departamentoNombre: 'Ingeniería y Desarrollo',
    rolId: 3,
    rolCodigo: 'DEV_INGENIERO',
    rolNombre: 'Ingeniero de Desarrollo',
    isActive: true,
    ultimoLogin: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    createdAt: '2026-01-15T10:00:00Z',
    permisos: ['TICKETS_RESOLVE', 'TICKETS_VIEW', 'AUDIT_VIEW'],
  },
  {
    id: 3,
    email: 'henry.monroy@tunegocio.pe',
    nombre: 'Henry',
    apellido: 'Monroy',
    telefono: '+51 987 333 444',
    departamentoId: 1,
    departamentoCodigo: 'SOPORTE',
    departamentoNombre: 'TI y Soporte Técnico',
    rolId: 2,
    rolCodigo: 'AGENTE_SOPORTE',
    rolNombre: 'Agente de Soporte',
    isActive: true,
    ultimoLogin: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: '2026-01-15T10:30:00Z',
    permisos: ['TICKETS_CREATE', 'TICKETS_ESCALATE', 'CLIENTS_VIEW', 'TICKETS_VIEW'],
  },
  {
    id: 4,
    email: 'josue.morales@tunegocio.pe',
    nombre: 'Josue',
    apellido: 'Morales',
    telefono: '+51 987 555 666',
    departamentoId: 3,
    departamentoCodigo: 'VENTAS',
    departamentoNombre: 'Comercial y Cuentas SaaS',
    rolId: 4,
    rolCodigo: 'EJECUTIVO_VENTAS',
    rolNombre: 'Ejecutivo de Ventas',
    isActive: true,
    ultimoLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: '2026-01-18T11:00:00Z',
    permisos: ['CLIENTS_VIEW', 'CLIENTS_NOTES', 'FEEDBACK_VOTE', 'FEEDBACK_CREATE'],
  },
  {
    id: 5,
    email: 'eduardo.sanchez@tunegocio.pe',
    nombre: 'Eduardo',
    apellido: 'Sánchez',
    telefono: '+51 987 777 888',
    departamentoId: 4,
    departamentoCodigo: 'MKT',
    departamentoNombre: 'Producto y Marketing',
    rolId: 5,
    rolCodigo: 'MARKETING_LEAD',
    rolNombre: 'Líder de Producto',
    isActive: true,
    ultimoLogin: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    createdAt: '2026-01-18T11:30:00Z',
    permisos: ['FEEDBACK_KANBAN', 'ANNOUNCEMENTS_MANAGE', 'CHANGELOG_MANAGE'],
  },
  {
    id: 6,
    email: 'carlos.valdivia@tunegocio.pe',
    nombre: 'Carlos',
    apellido: 'Valdivia',
    telefono: '+51 987 222 333',
    departamentoId: 1,
    departamentoCodigo: 'SOPORTE',
    departamentoNombre: 'TI y Soporte Técnico',
    rolId: 2,
    rolCodigo: 'AGENTE_SOPORTE',
    rolNombre: 'Agente de Soporte',
    isActive: true,
    ultimoLogin: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    createdAt: '2026-02-01T09:00:00Z',
    permisos: ['TICKETS_CREATE', 'TICKETS_ESCALATE', 'CLIENTS_VIEW', 'TICKETS_VIEW'],
  },
  {
    id: 7,
    email: 'mariana.rios@tunegocio.pe',
    nombre: 'Mariana',
    apellido: 'Ríos',
    telefono: '+51 987 444 555',
    departamentoId: 2,
    departamentoCodigo: 'DEV',
    departamentoNombre: 'Ingeniería y Desarrollo',
    rolId: 3,
    rolCodigo: 'DEV_INGENIERO',
    rolNombre: 'Ingeniero de Desarrollo',
    isActive: true,
    ultimoLogin: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    createdAt: '2026-02-05T14:00:00Z',
    permisos: ['TICKETS_RESOLVE', 'TICKETS_VIEW'],
  },
];

const INITIAL_ROLES: RoleWithPermissions[] = [
  {
    id: 1,
    codigo: 'ADMIN',
    nombre: 'Administrador General',
    descripcion: 'Control total de la infraestructura, asignación de roles, departamentos y auditoría.',
    isActive: true,
    totalUsuarios: 1,
    permisos: [
      { id: 1, codigo: 'USERS_MANAGE', modulo: 'Administración', descripcion: 'Alta, baja y modificación de usuarios y departamentos' },
      { id: 2, codigo: 'TICKETS_FULL', modulo: 'Incidentes', descripcion: 'Gestión total de incidentes y resolución P1' },
      { id: 3, codigo: 'AUDIT_FULL', modulo: 'Operaciones', descripcion: 'Consulta inmutable de logs de auditoría' },
      { id: 4, codigo: 'ANNOUNCEMENTS_MANAGE', modulo: 'Comunicados', descripcion: 'Emisión de alertas operativas críticas' },
    ],
  },
  {
    id: 2,
    codigo: 'AGENTE_SOPORTE',
    nombre: 'Agente de Soporte',
    descripcion: 'Recepción de llamadas, tickets N1/N2, escalación a ingeniería y consulta 360° de clientes.',
    isActive: true,
    totalUsuarios: 2,
    permisos: [
      { id: 5, codigo: 'TICKETS_CREATE', modulo: 'Incidentes', descripcion: 'Registro de nuevas incidencias con evidencias S3' },
      { id: 6, codigo: 'TICKETS_ESCALATE', modulo: 'Incidentes', descripcion: 'Escalación formal a desarrollo TI' },
      { id: 7, codigo: 'CLIENTS_VIEW', modulo: 'Comercial', descripcion: 'Consulta de ficha 360° y contactos clave' },
    ],
  },
  {
    id: 3,
    codigo: 'DEV_INGENIERO',
    nombre: 'Ingeniero de Desarrollo',
    descripcion: 'Diagnóstico técnico de microservicios, resolución de fallas en código y paso a QA.',
    isActive: true,
    totalUsuarios: 2,
    permisos: [
      { id: 8, codigo: 'TICKETS_RESOLVE', modulo: 'Incidentes', descripcion: 'Diagnóstico y cambio de estado a Resuelto/QA' },
      { id: 9, codigo: 'AUDIT_VIEW', modulo: 'Operaciones', descripcion: 'Inspección de trazas y logs de errores' },
    ],
  },
  {
    id: 4,
    codigo: 'EJECUTIVO_VENTAS',
    nombre: 'Ejecutivo de Cuentas SaaS',
    descripcion: 'Fidelización de cartera ARR, control de riesgo de Churn y registro de solicitudes de producto.',
    isActive: true,
    totalUsuarios: 1,
    permisos: [
      { id: 10, codigo: 'CLIENTS_NOTES', modulo: 'Comercial', descripcion: 'Bitácora de notas interdepartamentales y renovación' },
      { id: 11, codigo: 'FEEDBACK_VOTE', modulo: 'Producto', descripcion: 'Votación ponderada con ARR de clientes' },
    ],
  },
  {
    id: 5,
    codigo: 'MARKETING_LEAD',
    nombre: 'Líder de Producto & Marketing',
    descripcion: 'Priorización del Roadmap (RICE), gestión del tablero Kanban y publicación de Changelogs.',
    isActive: true,
    totalUsuarios: 1,
    permisos: [
      { id: 12, codigo: 'FEEDBACK_KANBAN', modulo: 'Producto', descripcion: 'Mover iniciativas entre columnas del Roadmap' },
      { id: 13, codigo: 'CHANGELOG_MANAGE', modulo: 'Comunicados', descripcion: 'Publicación de notas de versión y entregas' },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private http = inject(HttpClient);

  readonly users = signal<InternalUser[]>(this.getStoredUsers());
  readonly departments = signal<DepartmentSummary[]>(this.getStoredDepartments());
  readonly roles = signal<RoleWithPermissions[]>(INITIAL_ROLES);
  readonly isLoading = signal<boolean>(false);

  // Filtros reactivos
  readonly searchQuery = signal<string>('');
  readonly selectedDepartmentFilter = signal<number | null>(null);
  readonly selectedRoleFilter = signal<number | null>(null);

  // Lista filtrada reactiva
  readonly filteredUsers = computed(() => {
    let list = this.users();
    const q = this.searchQuery().trim().toLowerCase();
    const deptId = this.selectedDepartmentFilter();
    const rolId = this.selectedRoleFilter();

    if (deptId !== null) {
      list = list.filter((u) => u.departamentoId === deptId);
    }
    if (rolId !== null) {
      list = list.filter((u) => u.rolId === rolId);
    }
    if (q) {
      list = list.filter(
        (u) =>
          u.nombre.toLowerCase().includes(q) ||
          u.apellido.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.departamentoNombre.toLowerCase().includes(q) ||
          u.rolNombre.toLowerCase().includes(q)
      );
    }
    return list;
  });

  // Métricas agregadas
  readonly metrics = computed(() => {
    const list = this.users();
    return {
      totalActivos: list.filter((u) => u.isActive).length,
      soporteCount: list.filter((u) => u.rolCodigo === 'AGENTE_SOPORTE' && u.isActive).length,
      devCount: list.filter((u) => u.rolCodigo === 'DEV_INGENIERO' && u.isActive).length,
      ventasCount: list.filter((u) => u.rolCodigo === 'EJECUTIVO_VENTAS' && u.isActive).length,
      totalDeptos: this.departments().filter((d) => d.isActive).length,
    };
  });

  /**
   * Carga los usuarios internos (GET /api/v1/users)
   */
  getUsers(): Observable<InternalUser[]> {
    this.isLoading.set(true);
    const url = `${environment.apiUrl}/users`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const list: InternalUser[] = data.map((u: any) => ({
            id: u.id,
            email: u.email,
            nombre: u.nombre,
            apellido: u.apellido,
            telefono: u.telefono,
            departamentoId: u.departamentoId,
            departamentoCodigo: u.departamentoCodigo || 'DEV',
            departamentoNombre: u.departamentoNombre || 'Departamento',
            rolId: u.rolId,
            rolCodigo: u.rolCodigo || 'AGENTE_SOPORTE',
            rolNombre: u.rolNombre || 'Rol',
            isActive: u.isActive ?? true,
            ultimoLogin: u.ultimoLogin,
            createdAt: u.createdAt || new Date().toISOString(),
            permisos: u.permisos || [],
          }));
          this.saveUsers(list);
          this.isLoading.set(false);
          return list;
        }
        this.isLoading.set(false);
        return this.users();
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of(this.users());
      })
    );
  }

  /**
   * Registra un nuevo usuario interno (POST /api/v1/users)
   */
  createUser(req: CreateInternalUserRequest): Observable<InternalUser> {
    const url = `${environment.apiUrl}/users`;

    return this.http.post<any>(url, req).pipe(
      map((res) => {
        const item = res?.data || res;
        if (item && item.id) {
          const newUser: InternalUser = {
            id: item.id,
            email: item.email,
            nombre: item.nombre,
            apellido: item.apellido,
            telefono: item.telefono,
            departamentoId: item.departamentoId,
            departamentoCodigo: item.departamentoCodigo || 'SOPORTE',
            departamentoNombre: item.departamentoNombre || 'Departamento',
            rolId: item.rolId,
            rolCodigo: item.rolCodigo || 'AGENTE_SOPORTE',
            rolNombre: item.rolNombre || 'Rol',
            isActive: true,
            createdAt: new Date().toISOString(),
            permisos: item.permisos || [],
          };
          this.saveUsers([newUser, ...this.users()]);
          this.updateDepartmentUserCount(req.departamentoId, 1);
          return newUser;
        }
        return this.createUserLocal(req);
      }),
      catchError(() => of(this.createUserLocal(req)))
    );
  }

  /**
   * Activa o desactiva la cuenta de un usuario (PUT /api/v1/users/{id}/status)
   */
  toggleUserStatus(userId: number, isActive: boolean): Observable<boolean> {
    const url = `${environment.apiUrl}/users/${userId}/status`;

    return this.http.put<any>(url, { isActive }).pipe(
      map(() => {
        this.updateStatusLocal(userId, isActive);
        return true;
      }),
      catchError(() => {
        this.updateStatusLocal(userId, isActive);
        return of(true);
      })
    );
  }

  /**
   * Obtiene la lista de departamentos (GET /api/v1/users/departments)
   */
  getDepartments(): Observable<DepartmentSummary[]> {
    const url = `${environment.apiUrl}/users/departments`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          this.saveDepartments(data);
          return data;
        }
        return this.departments();
      }),
      catchError(() => of(this.departments()))
    );
  }

  /**
   * Registra un nuevo departamento (POST /api/v1/users/departments)
   */
  createDepartment(req: CreateDepartmentRequest): Observable<DepartmentSummary> {
    const url = `${environment.apiUrl}/users/departments`;

    return this.http.post<any>(url, req).pipe(
      map((res) => {
        const item = res?.data || res;
        if (item && item.id) {
          const newDept: DepartmentSummary = {
            id: item.id,
            codigo: item.codigo,
            nombre: item.nombre,
            descripcion: item.descripcion,
            isActive: true,
            totalUsuarios: 0,
            createdAt: new Date().toISOString(),
          };
          this.saveDepartments([...this.departments(), newDept]);
          return newDept;
        }
        return this.createDepartmentLocal(req);
      }),
      catchError(() => of(this.createDepartmentLocal(req)))
    );
  }

  /**
   * Obtiene la matriz de roles y permisos (GET /api/v1/users/roles)
   */
  getRoles(): Observable<RoleWithPermissions[]> {
    const url = `${environment.apiUrl}/users/roles`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          this.roles.set(data);
          return data;
        }
        return this.roles();
      }),
      catchError(() => of(this.roles()))
    );
  }

  // --- MÉTODOS LOCALES RESILIENTES (OFFLINE FALLBACK) ---

  private createUserLocal(req: CreateInternalUserRequest): InternalUser {
    const depto = this.departments().find((d) => d.id === req.departamentoId);
    const rol = this.roles().find((r) => r.id === req.rolId);

    const newUser: InternalUser = {
      id: Date.now(),
      email: req.email,
      nombre: req.nombre,
      apellido: req.apellido,
      telefono: req.telefono,
      departamentoId: req.departamentoId,
      departamentoCodigo: depto?.codigo || 'DEPTO',
      departamentoNombre: depto?.nombre || 'Departamento Corporativo',
      rolId: req.rolId,
      rolCodigo: rol?.codigo || 'AGENTE_SOPORTE',
      rolNombre: rol?.nombre || 'Agente de Soporte',
      isActive: true,
      createdAt: new Date().toISOString(),
      permisos: rol?.permisos.map((p) => p.codigo) || [],
    };

    this.saveUsers([newUser, ...this.users()]);
    this.updateDepartmentUserCount(req.departamentoId, 1);
    return newUser;
  }

  private updateStatusLocal(userId: number, isActive: boolean): void {
    const list = this.users().map((u) => (u.id === userId ? { ...u, isActive } : u));
    this.saveUsers(list);
  }

  private createDepartmentLocal(req: CreateDepartmentRequest): DepartmentSummary {
    const newDept: DepartmentSummary = {
      id: Date.now(),
      codigo: req.codigo.toUpperCase(),
      nombre: req.nombre,
      descripcion: req.descripcion,
      isActive: true,
      totalUsuarios: 0,
      createdAt: new Date().toISOString(),
    };
    this.saveDepartments([...this.departments(), newDept]);
    return newDept;
  }

  private updateDepartmentUserCount(deptId: number, delta: number): void {
    const list = this.departments().map((d) =>
      d.id === deptId ? { ...d, totalUsuarios: Math.max(0, d.totalUsuarios + delta) } : d
    );
    this.saveDepartments(list);
  }

  private getStoredUsers(): InternalUser[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  private saveUsers(list: InternalUser[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
    } catch {}
    this.users.set(list);
  }

  private getStoredDepartments(): DepartmentSummary[] {
    try {
      const data = localStorage.getItem(DEPTS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  }

  private saveDepartments(list: DepartmentSummary[]): void {
    try {
      localStorage.setItem(DEPTS_STORAGE_KEY, JSON.stringify(list));
    } catch {}
    this.departments.set(list);
  }
}
