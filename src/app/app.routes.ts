import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
  // Rutas de Autenticación (Públicas / Solo Invitados)
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        component: LoginComponent,
      },
    ],
  },
  {
    path: 'register',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
    ],
  },

  // Rutas Privadas / Protegidas por Sesión
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      // Módulo 3: Core de Incidentes (Tickets)
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/tickets/ticket-list/ticket-list.component').then(
            (m) => m.TicketListComponent
          ),
      },
      {
        path: 'tickets/new',
        loadComponent: () =>
          import('./features/tickets/ticket-form/ticket-form.component').then(
            (m) => m.TicketFormComponent
          ),
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/tickets/ticket-detail/ticket-detail.component').then(
            (m) => m.TicketDetailComponent
          ),
      },
      // Módulo 4: Feedback de Producto & Tablero Kanban Roadmap
      {
        path: 'feedback',
        loadComponent: () =>
          import('./features/feedback/kanban-roadmap/kanban-roadmap.component').then(
            (m) => m.KanbanRoadmapComponent
          ),
      },
      // Módulo 2: Clientes SaaS & Ficha 360
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/client-list/client-list.component').then(
            (m) => m.ClientListComponent
          ),
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./features/clients/client-360/client-360.component').then(
            (m) => m.Client360Component
          ),
      },
      // Módulo 5: Avisos Operativos & Changelog
      {
        path: 'announcements',
        loadComponent: () =>
          import(
            './features/announcements/announcements.component'
          ).then((m) => m.AnnouncementsComponent),
      },
      // Módulo 6: Métricas SLA, Salud AWS & Logs de Auditoría
      {
        path: 'operations',
        loadComponent: () =>
          import('./features/operations/operations.component').then(
            (m) => m.OperationsComponent
          ),
      },
      // Módulo 1: Administración de Organización & Usuarios (RBAC) - Solo Rol ADMIN
      {
        path: 'admin/users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/admin/user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
      {
        path: 'admin',
        redirectTo: 'admin/users',
        pathMatch: 'full',
      },
    ],
  },

  // Ruta Comodín
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
