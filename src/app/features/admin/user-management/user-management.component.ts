import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OrganizationService } from '../../../core/services/organization.service';
import { AuthService } from '../../../core/services/auth.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input/input-text.component';
import {
  LucideUsers,
  LucideUserPlus,
  LucideBuilding2,
  LucideShield,
  LucideSearch,
  LucideCheckCircle2,
  LucideMail,
  LucideRefreshCw,
  LucideUserCheck,
  LucideUserX,
  LucideLock,
} from '@lucide/angular';

type AdminTab = 'users' | 'departments' | 'rbac';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    LucideUsers,
    LucideUserPlus,
    LucideBuilding2,
    LucideShield,
    LucideSearch,
    LucideCheckCircle2,
    LucideMail,
    LucideRefreshCw,
    LucideUserCheck,
    LucideUserX,
    LucideLock,
  ],
  template: `
    <div class="space-y-6">
      <!-- HEADER CON RESUMEN INSTITUCIONAL -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-opsBorder">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <svg lucideUsers class="w-5 h-5"></svg>
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-opsText-primary tracking-tight">
                Administración de Organización & Usuarios
              </h1>
              <p class="text-xs sm:text-sm text-opsText-muted mt-0.5">
                Control de acceso RBAC, gestión de colaboradores internos y estructura departamental de TuNegocio.pe.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <app-button
            variant="secondary"
            size="sm"
            (btnClick)="refreshData()"
          >
            <svg lucideRefreshCw class="w-3.5 h-3.5"></svg>
            <span>Sincronizar</span>
          </app-button>

          @if (isAdmin()) {
            @if (activeTab() === 'users') {
              <app-button
                variant="primary"
                size="sm"
                (btnClick)="openCreateUserModal()"
              >
                <svg lucideUserPlus class="w-3.5 h-3.5"></svg>
                <span>+ Nuevo Colaborador</span>
              </app-button>
            } @else if (activeTab() === 'departments') {
              <app-button
                variant="primary"
                size="sm"
                (btnClick)="openCreateDeptModal()"
              >
                <svg lucideBuilding2 class="w-3.5 h-3.5"></svg>
                <span>+ Nuevo Departamento</span>
              </app-button>
            }
          }
        </div>
      </div>

      <!-- ALERTA SI NO ES ADMIN -->
      @if (!isAdmin()) {
        <div class="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-400 text-xs font-medium">
          <svg lucideLock class="w-4 h-4 shrink-0"></svg>
          <span>Modo de Solo Lectura: Tu rol actual ({{ authService.userRole() }}) no cuenta con privilegios de Administrador para crear departamentos o dar de alta colaboradores.</span>
        </div>
      }

      <!-- TABS DE NAVEGACIÓN ADMINISTRATIVA -->
      <div class="flex items-center gap-2 border-b border-opsBorder pb-1 overflow-x-auto">
        <button
          type="button"
          (click)="setTab('users')"
          [class]="
            activeTab() === 'users'
              ? 'px-4 py-2 text-sm font-semibold text-opsPrimary border-b-2 border-opsPrimary bg-opsPrimary/10 rounded-t-lg transition-colors flex items-center gap-2'
              : 'px-4 py-2 text-sm font-medium text-opsText-muted hover:text-opsText-primary hover:bg-slate-800/50 rounded-t-lg transition-colors flex items-center gap-2'
          "
        >
          <svg lucideUsers class="w-4 h-4"></svg>
          <span>Colaboradores Internos</span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 font-mono">
            {{ orgService.users().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="setTab('departments')"
          [class]="
            activeTab() === 'departments'
              ? 'px-4 py-2 text-sm font-semibold text-opsPrimary border-b-2 border-opsPrimary bg-opsPrimary/10 rounded-t-lg transition-colors flex items-center gap-2'
              : 'px-4 py-2 text-sm font-medium text-opsText-muted hover:text-opsText-primary hover:bg-slate-800/50 rounded-t-lg transition-colors flex items-center gap-2'
          "
        >
          <svg lucideBuilding2 class="w-4 h-4"></svg>
          <span>Estructura Departamental</span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 font-mono">
            {{ orgService.departments().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="setTab('rbac')"
          [class]="
            activeTab() === 'rbac'
              ? 'px-4 py-2 text-sm font-semibold text-opsPrimary border-b-2 border-opsPrimary bg-opsPrimary/10 rounded-t-lg transition-colors flex items-center gap-2'
              : 'px-4 py-2 text-sm font-medium text-opsText-muted hover:text-opsText-primary hover:bg-slate-800/50 rounded-t-lg transition-colors flex items-center gap-2'
          "
        >
          <svg lucideShield class="w-4 h-4"></svg>
          <span>Matriz de Roles & Permisos (RBAC)</span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 font-mono">
            {{ orgService.roles().length }}
          </span>
        </button>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 1: GESTIÓN DE COLABORADORES INTERNOS                          -->
      <!-- ================================================================= -->
      @if (activeTab() === 'users') {
        <!-- KPIS RESUMEN -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <app-card>
            <div class="p-3 sm:p-4">
              <span class="text-xs uppercase tracking-wider text-opsText-muted font-medium">Usuarios Activos</span>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                  {{ orgService.metrics().totalActivos }}
                </span>
                <span class="text-xs text-opsText-muted">habilitados</span>
              </div>
            </div>
          </app-card>

          <app-card>
            <div class="p-3 sm:p-4">
              <span class="text-xs uppercase tracking-wider text-opsText-muted font-medium">Agentes de Soporte</span>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
                  {{ orgService.metrics().soporteCount }}
                </span>
                <span class="text-xs text-opsText-muted">atención N1/N2</span>
              </div>
            </div>
          </app-card>

          <app-card>
            <div class="p-3 sm:p-4">
              <span class="text-xs uppercase tracking-wider text-opsText-muted font-medium">Ingenieros DEV</span>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-bold font-mono text-indigo-400">
                  {{ orgService.metrics().devCount }}
                </span>
                <span class="text-xs text-opsText-muted">resolución bugs</span>
              </div>
            </div>
          </app-card>

          <app-card>
            <div class="p-3 sm:p-4">
              <span class="text-xs uppercase tracking-wider text-opsText-muted font-medium">Comercial & Ventas</span>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-bold font-mono text-amber-400">
                  {{ orgService.metrics().ventasCount }}
                </span>
                <span class="text-xs text-opsText-muted">gestión ARR</span>
              </div>
            </div>
          </app-card>
        </div>

        <!-- FILTROS Y BÚSQUEDA -->
        <app-card>
          <div class="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-opsText-muted">
                <svg lucideSearch class="w-4 h-4"></svg>
              </div>
              <input
                type="text"
                [ngModel]="orgService.searchQuery()"
                (ngModelChange)="orgService.searchQuery.set($event)"
                placeholder="Buscar por nombre, correo o rol..."
                class="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-opsBorder rounded-lg text-sm text-opsText-primary placeholder-opsText-muted focus:outline-none focus:border-opsPrimary"
              />
            </div>

            <div class="flex items-center gap-2.5">
              <!-- Filtro Departamento -->
              <select
                [ngModel]="orgService.selectedDepartmentFilter()"
                (ngModelChange)="orgService.selectedDepartmentFilter.set($event === 'ALL' ? null : +$event)"
                class="px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-xs sm:text-sm text-opsText-primary focus:outline-none focus:border-opsPrimary"
              >
                <option value="ALL">Todos los Departamentos</option>
                @for (d of orgService.departments(); track d.id) {
                  <option [value]="d.id">{{ d.nombre }}</option>
                }
              </select>

              <!-- Filtro Rol -->
              <select
                [ngModel]="orgService.selectedRoleFilter()"
                (ngModelChange)="orgService.selectedRoleFilter.set($event === 'ALL' ? null : +$event)"
                class="px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-xs sm:text-sm text-opsText-primary focus:outline-none focus:border-opsPrimary"
              >
                <option value="ALL">Todos los Roles</option>
                @for (r of orgService.roles(); track r.id) {
                  <option [value]="r.id">{{ r.nombre }}</option>
                }
              </select>
            </div>
          </div>
        </app-card>

        <!-- TABLA DE USUARIOS INTERNOS -->
        <app-card>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-opsBorder bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-opsText-muted">
                  <th class="py-3 px-4">Colaborador</th>
                  <th class="py-3 px-4">Departamento</th>
                  <th class="py-3 px-4">Rol Asignado</th>
                  <th class="py-3 px-4">Teléfono</th>
                  <th class="py-3 px-4">Estado</th>
                  <th class="py-3 px-4">Último Acceso</th>
                  <th class="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-opsBorder/60 text-sm">
                @for (u of orgService.filteredUsers(); track u.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <!-- Colaborador -->
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/10">
                          {{ u.nombre.charAt(0) }}{{ u.apellido.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-medium text-opsText-primary">
                            {{ u.nombre }} {{ u.apellido }}
                          </p>
                          <p class="text-xs text-opsText-muted flex items-center gap-1 font-mono">
                            <svg lucideMail class="w-3 h-3 text-slate-500"></svg>
                            {{ u.email }}
                          </p>
                        </div>
                      </div>
                    </td>

                    <!-- Departamento -->
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        <svg lucideBuilding2 class="w-3 h-3 text-indigo-400"></svg>
                        {{ u.departamentoNombre }}
                      </span>
                    </td>

                    <!-- Rol -->
                    <td class="py-3.5 px-4">
                      <span
                        [class]="
                          u.rolCodigo === 'ADMIN'
                            ? 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : u.rolCodigo === 'DEV_INGENIERO'
                            ? 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : u.rolCodigo === 'AGENTE_SOPORTE'
                            ? 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : u.rolCodigo === 'EJECUTIVO_VENTAS'
                            ? 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        "
                      >
                        {{ u.rolNombre }}
                      </span>
                    </td>

                    <!-- Teléfono -->
                    <td class="py-3.5 px-4 text-xs font-mono text-opsText-secondary">
                      {{ u.telefono || 'No registrado' }}
                    </td>

                    <!-- Estado -->
                    <td class="py-3.5 px-4">
                      @if (u.isActive) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Activo
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          Inactivo
                        </span>
                      }
                    </td>

                    <!-- Último Acceso -->
                    <td class="py-3.5 px-4 text-xs text-opsText-muted">
                      {{ u.ultimoLogin ? (u.ultimoLogin | date: 'dd/MM/yyyy HH:mm') : 'Sin acceso registrado' }}
                    </td>

                    <!-- Acciones -->
                    <td class="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        (click)="toggleStatus(u)"
                        [title]="u.isActive ? 'Desactivar cuenta' : 'Activar cuenta'"
                        class="p-1.5 rounded-md hover:bg-slate-700/60 transition-colors text-opsText-muted hover:text-opsText-primary"
                      >
                        @if (u.isActive) {
                          <svg lucideUserX class="w-4 h-4 text-rose-400"></svg>
                        } @else {
                          <svg lucideUserCheck class="w-4 h-4 text-emerald-400"></svg>
                        }
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="py-8 text-center text-opsText-muted">
                      No se encontraron colaboradores que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }

      <!-- ================================================================= -->
      <!-- TAB 2: ESTRUCTURA DEPARTAMENTAL                                   -->
      <!-- ================================================================= -->
      @if (activeTab() === 'departments') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (d of orgService.departments(); track d.id) {
            <app-card>
              <div class="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      {{ d.codigo }}
                    </span>
                    <span class="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Operativo
                    </span>
                  </div>

                  <h3 class="text-base font-semibold text-opsText-primary mt-2.5">
                    {{ d.nombre }}
                  </h3>
                  <p class="text-xs text-opsText-muted mt-1 leading-relaxed">
                    {{ d.descripcion || 'Sin descripción corporativa registrada.' }}
                  </p>
                </div>

                <div class="pt-3 border-t border-opsBorder/60 flex items-center justify-between text-xs text-opsText-secondary">
                  <span class="flex items-center gap-1 font-mono">
                    <svg lucideUsers class="w-3.5 h-3.5 text-indigo-400"></svg>
                    {{ d.totalUsuarios }} colaboradores asignados
                  </span>
                  <span class="text-opsText-muted font-mono">
                    ID #{{ d.id }}
                  </span>
                </div>
              </div>
            </app-card>
          }
        </div>
      }

      <!-- ================================================================= -->
      <!-- TAB 3: MATRIZ DE ROLES & PERMISOS (RBAC)                          -->
      <!-- ================================================================= -->
      @if (activeTab() === 'rbac') {
        <div class="space-y-4">
          <div class="p-4 rounded-xl bg-slate-900/70 border border-opsBorder flex items-start gap-3">
            <svg lucideLock class="w-5 h-5 text-indigo-400 mt-0.5"></svg>
            <div>
              <h4 class="text-sm font-semibold text-opsText-primary">Auditoría del Control de Acceso Basado en Roles (RBAC)</h4>
              <p class="text-xs text-opsText-muted mt-0.5">
                Definición explícita de privilegios transaccionales mapeados sobre las 30 tablas de la base de datos MySQL (Módulos 1 al 6).
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (r of orgService.roles(); track r.id) {
              <app-card>
                <div class="p-5 space-y-3.5">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-xs font-mono font-bold text-opsPrimary tracking-wider uppercase">
                        {{ r.codigo }}
                      </span>
                      <h3 class="text-base font-bold text-opsText-primary">
                        {{ r.nombre }}
                      </h3>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-300">
                      {{ r.totalUsuarios }} usuarios
                    </span>
                  </div>

                  <p class="text-xs text-opsText-muted">
                    {{ r.descripcion }}
                  </p>

                  <div class="pt-2 border-t border-opsBorder/60">
                    <span class="text-xs font-semibold uppercase tracking-wider text-opsText-secondary">
                      Privilegios Asignados ({{ r.permisos.length }}):
                    </span>
                    <ul class="mt-2 space-y-1.5">
                      @for (p of r.permisos; track p.id) {
                        <li class="flex items-start gap-2 text-xs">
                          <svg lucideCheckCircle2 class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"></svg>
                          <span class="text-opsText-primary font-medium font-mono text-[11px] text-cyan-300">
                            [{{ p.modulo }}]
                          </span>
                          <span class="text-opsText-muted">
                            {{ p.descripcion }}
                          </span>
                        </li>
                      }
                    </ul>
                  </div>
                </div>
              </app-card>
            }
          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- MODAL: REGISTRAR NUEVO COLABORADOR                                -->
      <!-- ================================================================= -->
      @if (showCreateUserModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div class="bg-opsCard border border-opsBorder rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <!-- Modal Header -->
            <div class="p-5 border-b border-opsBorder flex items-center justify-between bg-slate-900/60">
              <div class="flex items-center gap-2.5">
                <div class="p-2 bg-indigo-500/15 rounded-lg text-indigo-400">
                  <svg lucideUserPlus class="w-5 h-5"></svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-opsText-primary">Registrar Nuevo Colaborador</h3>
                  <p class="text-xs text-opsText-muted">Aprovisionamiento de cuenta interna para TuNegocio.pe</p>
                </div>
              </div>
              <button
                type="button"
                (click)="showCreateUserModal.set(false)"
                class="text-opsText-muted hover:text-opsText-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <!-- Modal Form -->
            <form [formGroup]="userForm" (ngSubmit)="submitCreateUser()" class="p-5 space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Nombre *</label>
                  <input
                    type="text"
                    formControlName="nombre"
                    placeholder="Ej. Andrés"
                    class="w-full px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm text-opsText-primary focus:border-opsPrimary focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Apellido *</label>
                  <input
                    type="text"
                    formControlName="apellido"
                    placeholder="Ej. Mendoza"
                    class="w-full px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm text-opsText-primary focus:border-opsPrimary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Correo Corporativo *</label>
                <div class="relative">
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="andres.mendoza@tunegocio.pe"
                    class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm text-opsText-primary font-mono focus:border-opsPrimary focus:outline-none"
                  />
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <svg lucideMail class="w-4 h-4"></svg>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Teléfono Directo</label>
                  <input
                    type="text"
                    formControlName="telefono"
                    placeholder="+51 987 654 321"
                    class="w-full px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm text-opsText-primary font-mono focus:border-opsPrimary focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Contraseña Inicial</label>
                  <input
                    type="password"
                    formControlName="password"
                    placeholder="TuNegocio2026!"
                    class="w-full px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm text-opsText-primary font-mono focus:border-opsPrimary focus:outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Departamento *</label>
                  <select
                    formControlName="departamentoId"
                    class="w-full px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm text-opsText-primary focus:border-opsPrimary focus:outline-none"
                  >
                    @for (d of orgService.departments(); track d.id) {
                      <option [value]="d.id">{{ d.nombre }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Rol de Acceso *</label>
                  <select
                    formControlName="rolId"
                    class="w-full px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm text-opsText-primary focus:border-opsPrimary focus:outline-none"
                  >
                    @for (r of orgService.roles(); track r.id) {
                      <option [value]="r.id">{{ r.nombre }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="pt-4 border-t border-opsBorder flex justify-end gap-2.5">
                <app-button
                  variant="secondary"
                  size="sm"
                  (btnClick)="showCreateUserModal.set(false)"
                >
                  Cancelar
                </app-button>
                <app-button
                  variant="primary"
                  size="sm"
                  [disabled]="userForm.invalid || isSubmitting()"
                  (btnClick)="submitCreateUser()"
                >
                  <span>{{ isSubmitting() ? 'Registrando...' : 'Crear Colaborador' }}</span>
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- MODAL: REGISTRAR NUEVO DEPARTAMENTO                               -->
      <!-- ================================================================= -->
      @if (showCreateDeptModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div class="bg-opsCard border border-opsBorder rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div class="p-5 border-b border-opsBorder flex items-center justify-between bg-slate-900/60">
              <div class="flex items-center gap-2.5">
                <div class="p-2 bg-indigo-500/15 rounded-lg text-indigo-400">
                  <svg lucideBuilding2 class="w-5 h-5"></svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-opsText-primary">Nuevo Departamento</h3>
                  <p class="text-xs text-opsText-muted">Estructura organizacional de TuNegocio.pe</p>
                </div>
              </div>
              <button
                type="button"
                (click)="showCreateDeptModal.set(false)"
                class="text-opsText-muted hover:text-opsText-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form [formGroup]="deptForm" (ngSubmit)="submitCreateDept()" class="p-5 space-y-4">
              <div>
                <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Código Único *</label>
                <input
                  type="text"
                  formControlName="codigo"
                  placeholder="Ej. CALIDAD_QA o SEGURIDAD"
                  class="w-full px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm font-mono text-opsText-primary uppercase focus:border-opsPrimary focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Nombre del Departamento *</label>
                <input
                  type="text"
                  formControlName="nombre"
                  placeholder="Ej. Aseguramiento de Calidad (QA)"
                  class="w-full px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm text-opsText-primary focus:border-opsPrimary focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-opsText-muted uppercase mb-1">Descripción Funcional</label>
                <textarea
                  formControlName="descripcion"
                  rows="3"
                  placeholder="Responsabilidades y alcance técnico del área..."
                  class="w-full px-3 py-2 bg-slate-900 border border-opsBorder rounded-lg text-sm text-opsText-primary focus:border-opsPrimary focus:outline-none"
                ></textarea>
              </div>

              <div class="pt-4 border-t border-opsBorder flex justify-end gap-2.5">
                <app-button
                  variant="secondary"
                  size="sm"
                  (btnClick)="showCreateDeptModal.set(false)"
                >
                  Cancelar
                </app-button>
                <app-button
                  variant="primary"
                  size="sm"
                  [disabled]="deptForm.invalid || isSubmitting()"
                  (btnClick)="submitCreateDept()"
                >
                  <span>{{ isSubmitting() ? 'Guardando...' : 'Crear Departamento' }}</span>
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class UserManagementComponent implements OnInit {
  orgService = inject(OrganizationService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly isAdmin = computed(() => this.authService.hasRole(['ADMIN']));
  readonly activeTab = signal<AdminTab>('users');
  readonly showCreateUserModal = signal<boolean>(false);
  readonly showCreateDeptModal = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  userForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    password: ['TuNegocio2026!'],
    departamentoId: [1, [Validators.required]],
    rolId: [2, [Validators.required]],
  });

  deptForm = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
  });

  ngOnInit(): void {
    this.refreshData();
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  refreshData(): void {
    this.orgService.getUsers().subscribe();
    this.orgService.getDepartments().subscribe();
    this.orgService.getRoles().subscribe();
  }

  openCreateUserModal(): void {
    if (!this.isAdmin()) return;
    this.userForm.reset({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: 'TuNegocio2026!',
      departamentoId: this.orgService.departments()[0]?.id || 1,
      rolId: this.orgService.roles()[1]?.id || 2,
    });
    this.showCreateUserModal.set(true);
  }

  openCreateDeptModal(): void {
    if (!this.isAdmin()) return;
    this.deptForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
    });
    this.showCreateDeptModal.set(true);
  }

  submitCreateUser(): void {
    if (!this.isAdmin()) return;
    if (this.userForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.userForm.getRawValue();

    this.orgService
      .createUser({
        nombre: val.nombre!,
        apellido: val.apellido!,
        email: val.email!,
        telefono: val.telefono || undefined,
        password: val.password || 'TuNegocio2026!',
        departamentoId: Number(val.departamentoId),
        rolId: Number(val.rolId),
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showCreateUserModal.set(false);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  submitCreateDept(): void {
    if (!this.isAdmin()) return;
    if (this.deptForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.deptForm.getRawValue();

    this.orgService
      .createDepartment({
        codigo: val.codigo!,
        nombre: val.nombre!,
        descripcion: val.descripcion || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showCreateDeptModal.set(false);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  toggleStatus(user: any): void {
    if (!this.isAdmin()) return;
    const newStatus = !user.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    if (confirm(`¿Estás seguro de ${action} la cuenta de ${user.nombre} ${user.apellido}?`)) {
      this.orgService.toggleUserStatus(user.id, newStatus).subscribe();
    }
  }
}
