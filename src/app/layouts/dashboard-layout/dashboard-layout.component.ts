import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  LucideLayoutDashboard,
  LucideTicket,
  LucideKanban,
  LucideBuilding2,
  LucideMegaphone,
  LucideActivity,
  LucideLogOut,
  LucideMenu,
  LucideX,
  LucideShield,
  LucideClock,
  LucideSparkles,
  LucideUsers,
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideTicket,
    LucideKanban,
    LucideBuilding2,
    LucideMegaphone,
    LucideActivity,
    LucideLogOut,
    LucideMenu,
    LucideX,
    LucideShield,
    LucideClock,
    LucideSparkles,
    LucideUsers,
  ],
  template: `
    <div class="min-h-screen bg-canvas text-opsText-primary flex">
      <!-- SIDEBAR DESKTOP -->
      <aside
        class="hidden md:flex flex-col w-64 border-r border-surface-border bg-surface-card shrink-0 transition-all duration-200"
      >
        <!-- Logo & Brand Header -->
        <div class="h-16 px-5 border-b border-surface-border flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
              <svg lucideSparkles class="w-5 h-5 text-white"></svg>
            </div>
            <div>
              <div class="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                TuNegocio.pe
              </div>
              <div class="text-[11px] font-mono font-medium text-opsText-muted">
                PlatformOps Hub
              </div>
            </div>
          </div>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-canvas border border-surface-border text-opsText-muted">
            v1.0
          </span>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div class="px-3 pb-2 text-[10px] font-bold tracking-wider text-opsText-muted uppercase">
            Operaciones Centrales
          </div>

          <a
            routerLink="/dashboard"
            routerLinkActive="bg-primary-light text-white border-l-2 border-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg lucideLayoutDashboard class="w-4 h-4 text-primary"></svg>
            <span>Dashboard Turno</span>
          </a>

          <a
            routerLink="/tickets"
            routerLinkActive="bg-primary-light text-white border-l-2 border-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg lucideTicket class="w-4 h-4 text-accentCyan"></svg>
            <span>Incidentes (Tickets)</span>
            <span
              class="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25 shrink-0"
              title="2 Incidentes Críticos P1 Pendientes"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
              <span>2 Críticos</span>
            </span>
          </a>

          <a
            routerLink="/feedback"
            routerLinkActive="bg-primary-light text-white border-l-2 border-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg lucideKanban class="w-4 h-4 text-secondary"></svg>
            <span>Feedback & Roadmap</span>
          </a>

          <div class="pt-4 px-3 pb-2 text-[10px] font-bold tracking-wider text-opsText-muted uppercase">
            Administración & Auditoría
          </div>

          <a
            routerLink="/clients"
            routerLinkActive="bg-primary-light text-white border-l-2 border-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg lucideBuilding2 class="w-4 h-4 text-p2"></svg>
            <span>Clientes SaaS (360°)</span>
          </a>

          <a
            routerLink="/announcements"
            routerLinkActive="bg-primary-light text-white border-l-2 border-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg lucideMegaphone class="w-4 h-4 text-success"></svg>
            <span>Avisos & Changelog</span>
          </a>

          <a
            routerLink="/operations"
            routerLinkActive="bg-primary-light text-white border-l-2 border-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg lucideActivity class="w-4 h-4 text-opsText-muted"></svg>
            <span>Métricas SLA & Logs</span>
          </a>

          @if (isAdmin()) {
            <a
              routerLink="/admin/users"
              routerLinkActive="bg-primary-light text-white border-l-2 border-primary font-semibold"
              class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
            >
              <svg lucideUsers class="w-4 h-4 text-purple-400"></svg>
              <span>Usuarios & Organización</span>
            </a>
          }
        </nav>

        <!-- Current User Profile Footer -->
        <div class="p-3 border-t border-surface-border bg-canvas/40">
          <div class="flex items-center justify-between p-2 rounded-lg bg-surface-card border border-surface-border">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="h-9 w-9 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm shrink-0">
                {{ userInitial() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold text-white truncate">
                  {{ userFullName() }}
                </div>
                <div class="text-[10px] font-mono text-accentCyan flex items-center gap-1 truncate">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-accentCyan"></span>
                  {{ userDeptCode() }}
                </div>
              </div>
            </div>

            <button
              title="Cerrar sesión"
              (click)="onLogout()"
              class="p-1.5 text-opsText-muted hover:text-p1 hover:bg-p1-light rounded transition-colors"
            >
              <svg lucideLogOut class="w-4 h-4"></svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- TOPBAR -->
        <header class="h-16 border-b border-surface-border bg-surface-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <!-- Mobile Menu Toggle & Title -->
          <div class="flex items-center gap-3">
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 rounded-lg text-opsText-secondary hover:bg-surface-hover"
            >
              @if (mobileMenuOpen()) {
                <svg lucideX class="w-5 h-5"></svg>
              } @else {
                <svg lucideMenu class="w-5 h-5"></svg>
              }
            </button>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 text-xs text-opsText-secondary font-medium">
                <svg lucideClock class="w-3.5 h-3.5 text-opsText-muted"></svg>
                <span>Turno Activo: <strong class="text-white">Mañana (08:00 - 16:00)</strong></span>
              </div>
            </div>
          </div>

          <!-- Topbar Actions & Live Indicator -->
          <div class="flex items-center gap-3 sm:gap-4">
            <!-- Live Status Pill -->
            <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-card border border-surface-border text-xs" title="Conexión en tiempo real activa">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span class="text-[11px] font-medium tracking-wide text-success hidden sm:inline-block">
                En Vivo
              </span>
            </div>

            <!-- Role Badge -->
            <div class="hidden lg:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-canvas border border-surface-border text-opsText-secondary">
              <svg lucideShield class="w-3.5 h-3.5 text-primary"></svg>
              <span>Rol: <strong class="text-white">{{ userRoleName() }}</strong></span>
            </div>
          </div>
        </header>

        <!-- MOBILE MENU OVERLAY -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden border-b border-surface-border bg-surface-card p-4 space-y-2">
            <a
              (click)="mobileMenuOpen.set(false)"
              routerLink="/dashboard"
              class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover"
            >
              <svg lucideLayoutDashboard class="w-4 h-4 text-primary"></svg>
              <span>Dashboard Turno</span>
            </a>
            <a
              (click)="mobileMenuOpen.set(false)"
              routerLink="/tickets"
              class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover"
            >
              <svg lucideTicket class="w-4 h-4 text-accentCyan"></svg>
              <span>Incidentes (Tickets)</span>
            </a>
            <a
              (click)="mobileMenuOpen.set(false)"
              routerLink="/feedback"
              class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover"
            >
              <svg lucideKanban class="w-4 h-4 text-secondary"></svg>
              <span>Feedback & Roadmap</span>
            </a>
            <a
              (click)="mobileMenuOpen.set(false)"
              routerLink="/clients"
              class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover"
            >
              <svg lucideBuilding2 class="w-4 h-4 text-p2"></svg>
              <span>Clientes SaaS</span>
            </a>
            @if (isAdmin()) {
              <a
                (click)="mobileMenuOpen.set(false)"
                routerLink="/admin/users"
                class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-opsText-secondary hover:text-white hover:bg-surface-hover"
              >
                <svg lucideUsers class="w-4 h-4 text-purple-400"></svg>
                <span>Usuarios & Organización</span>
              </a>
            }

            <div class="pt-3 border-t border-surface-border flex items-center justify-between">
              <div class="text-xs text-white font-semibold">
                {{ userFullName() }}
              </div>
              <button
                (click)="onLogout()"
                class="text-xs text-p1 font-medium hover:underline"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        }

        <!-- PAGE CONTENT OUTLET -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);

  mobileMenuOpen = signal<boolean>(false);

  user = this.authService.currentUser;

  userFullName = computed(() => {
    const u = this.user();
    return u ? `${u.nombre} ${u.apellido}` : 'Usuario Conectado';
  });

  userInitial = computed(() => {
    const u = this.user();
    return u?.nombre ? u.nombre.charAt(0).toUpperCase() : 'U';
  });

  userDeptCode = computed(() => {
    const u = this.user();
    return u?.departamentoCodigo || 'OPERACIONES';
  });

  userRoleName = computed(() => {
    const u = this.user();
    return u?.rolCodigo || 'DEV_INGENIERO';
  });

  isAdmin = computed(() => this.authService.hasRole(['ADMIN']));

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
