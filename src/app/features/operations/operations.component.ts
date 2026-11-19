import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import {
  AuditAction,
  AuditLog,
  AuditTable,
} from '../../core/models/operations.model';
import {
  LucideActivity,
  LucideShieldCheck,
  LucideServer,
  LucideDatabase,
  LucideSearch,
  LucideFilter,
  LucideRefreshCw,
  LucideFileCode,
  LucideClock,
  LucideX,
  LucideSmartphone,
  LucideMonitor,
  LucideTerminal,
} from '@lucide/angular';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    CardComponent,
    LucideActivity,
    LucideShieldCheck,
    LucideServer,
    LucideDatabase,
    LucideSearch,
    LucideFilter,
    LucideRefreshCw,
    LucideFileCode,
    LucideClock,
    LucideX,
    LucideSmartphone,
    LucideMonitor,
    LucideTerminal,
  ],
  template: `
    <div class="space-y-6">
      <!-- HEADER & ACTIONS -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <svg lucideActivity class="w-6 h-6 text-opsAccent-indigo"></svg>
              <span>Métricas de SLA, Salud Cloud & Auditoría (Módulo 6)</span>
            </h1>
            <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-card border border-surface-border text-opsText-muted">
              Cumplimiento 98.4%
            </span>
          </div>
          <p class="text-xs sm:text-sm text-opsText-muted mt-1">
            Supervisión continua de acuerdos de nivel de servicio, latencias de AWS y registro inmutable de auditoría (logs_actividad).
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Switcher -->
          <div class="flex items-center bg-surface-card border border-surface-border rounded-lg p-1">
            <button
              (click)="activeTab.set('SLA')"
              [class.bg-opsAccent-indigo]="activeTab() === 'SLA'"
              [class.text-white]="activeTab() === 'SLA'"
              [class.text-opsText-muted]="activeTab() !== 'SLA'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
              <svg lucideShieldCheck class="w-3.5 h-3.5"></svg>
              <span>SLA & Servicios</span>
            </button>
            <button
              (click)="activeTab.set('AUDIT')"
              [class.bg-opsAccent-indigo]="activeTab() === 'AUDIT'"
              [class.text-white]="activeTab() === 'AUDIT'"
              [class.text-opsText-muted]="activeTab() !== 'AUDIT'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
              <svg lucideDatabase class="w-3.5 h-3.5"></svg>
              <span>Logs Auditoría</span>
            </button>
          </div>

          <!-- Refresh Health Ping Button -->
          <app-button
            variant="secondary"
            size="sm"
            [loading]="isPinging()"
            (buttonClick)="pingServices()">
            <svg lucideRefreshCw class="w-3.5 h-3.5"></svg>
            <span>Probar Latencias</span>
          </app-button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: SLA METRICS & AWS CLOUD HEALTH      -->
      <!-- ========================================== -->
      @if (activeTab() === 'SLA') {
        <div class="space-y-6">
          <!-- SLA KPIS -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <!-- KPI 1 -->
          <app-card>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">Cumplimiento Global</p>
                <p class="text-2xl font-bold font-mono text-opsStatus-success mt-1">
                  {{ operationsService.overallSlaStats().complianceRate | number : '1.1-1' }}%
                </p>
              </div>
              <div class="p-2.5 rounded-xl bg-opsStatus-success/10 text-opsStatus-success border border-opsStatus-success/20">
                <svg lucideShieldCheck class="w-5 h-5"></svg>
              </div>
            </div>
            <div class="mt-2 text-xs text-opsText-secondary flex items-center gap-1">
              <span>{{ operationsService.overallSlaStats().ticketsInSla }} de {{ operationsService.overallSlaStats().totalTickets }} tickets</span> resueltos a tiempo
            </div>
          </app-card>

          <!-- KPI 2 -->
          <app-card>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">MTTR Promedio Global</p>
                <p class="text-2xl font-bold font-mono text-white mt-1">
                  {{ operationsService.overallSlaStats().averageMttrHours | number : '1.1-1' }} <span class="text-xs font-normal text-opsText-muted">Horas</span>
                </p>
              </div>
              <div class="p-2.5 rounded-xl bg-opsAccent-indigo/10 text-opsAccent-indigo border border-opsAccent-indigo/20">
                <svg lucideClock class="w-5 h-5"></svg>
              </div>
            </div>
            <div class="mt-2 text-xs text-opsText-secondary">
              Tiempo medio de resolución de incidentes
            </div>
          </app-card>

          <!-- KPI 3 -->
          <app-card>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">Violaciones de SLA</p>
                <p class="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {{ operationsService.overallSlaStats().breached }} <span class="text-xs font-normal text-opsText-muted">casos</span>
                </p>
              </div>
              <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <svg lucideActivity class="w-5 h-5"></svg>
              </div>
            </div>
            <div class="mt-2 text-xs text-opsText-secondary">
              Incidentes resueltos fuera de ventana
            </div>
          </app-card>

          <!-- KPI 4 -->
          <app-card>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">Servicios Operativos</p>
                <p class="text-2xl font-bold font-mono text-opsAccent-cyan mt-1">
                  5 / 6 <span class="text-xs font-normal text-opsText-muted">nodos</span>
                </p>
              </div>
              <div class="p-2.5 rounded-xl bg-opsAccent-cyan/10 text-opsAccent-cyan border border-opsAccent-cyan/20">
                <svg lucideServer class="w-5 h-5"></svg>
              </div>
            </div>
            <div class="mt-2 text-xs text-opsText-secondary flex items-center gap-1">
              <span class="text-amber-400 font-medium">1 nodo degradado</span> (OSE SUNAT ext)
            </div>
          </app-card>
        </div>

        <!-- SLA BREAKDOWN TABLE BY SUBSCRIPTION PLAN -->
        <app-card>
          <div class="pb-3 border-b border-surface-border flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <svg lucideShieldCheck class="w-4 h-4 text-opsAccent-indigo"></svg>
                <span>Desglose de SLA por Nivel de Suscripción SaaS</span>
              </h3>
              <p class="text-xs text-opsText-muted mt-0.5">
                Cumplimiento contractual garantizado según el plan contratado por cada cliente corporativo.
              </p>
            </div>
            <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-canvas border border-surface-border text-opsText-muted">
              Periodo Mensual
            </span>
          </div>

          <div class="overflow-x-auto mt-4">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="border-b border-surface-border text-opsText-muted font-medium uppercase text-[11px] tracking-wider bg-surface-canvas/40">
                  <th class="py-3 px-4">Plan SaaS</th>
                  <th class="py-3 px-3 text-center">SLA Objetivo</th>
                  <th class="py-3 px-3 text-center">Total Tickets</th>
                  <th class="py-3 px-3 text-center">En SLA</th>
                  <th class="py-3 px-3 text-center">Fuera de SLA</th>
                  <th class="py-3 px-3 text-center">MTTR Promedio</th>
                  <th class="py-3 px-4 text-center">Cumplimiento %</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-border/50 text-opsText-primary">
                @for (item of operationsService.slaMetrics(); track item.planCodigo) {
                  <tr class="hover:bg-surface-elevated/40 transition-colors">
                    <td class="py-3 px-4">
                      <div class="font-bold text-white">{{ item.planNombre }}</div>
                      <span class="font-mono text-[10px] text-opsAccent-indigo">{{ item.planCodigo }}</span>
                    </td>
                    <td class="py-3 px-3 text-center font-mono font-bold text-white">
                      {{ item.slaHorasObjetivo }}h
                    </td>
                    <td class="py-3 px-3 text-center font-mono font-bold text-white">
                      {{ item.totalTickets }}
                    </td>
                    <td class="py-3 px-3 text-center font-mono text-emerald-400 font-bold">
                      {{ item.ticketsEnSla }}
                    </td>
                    <td class="py-3 px-3 text-center font-mono" [ngClass]="item.ticketsFueraSla > 0 ? 'text-amber-400 font-bold' : 'text-opsText-muted'">
                      {{ item.ticketsFueraSla }}
                    </td>
                    <td class="py-3 px-3 text-center font-mono text-opsText-secondary">
                      {{ item.mttrHorasPromedio | number : '1.1-1' }}h
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex flex-col items-center gap-1">
                        <span class="font-mono font-bold text-xs" [ngClass]="item.porcentajeCumplimiento >= 98 ? 'text-emerald-400' : 'text-amber-400'">
                          {{ item.porcentajeCumplimiento | number : '1.1-1' }}%
                        </span>
                        <div class="w-24 h-1.5 bg-surface-canvas rounded-full overflow-hidden border border-surface-border">
                          <div
                            class="h-full rounded-full transition-all"
                            [ngClass]="item.porcentajeCumplimiento >= 98 ? 'bg-emerald-500' : 'bg-amber-500'"
                            [style.width.%]="item.porcentajeCumplimiento"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>

        <!-- CLOUD HEALTH SERVICES GRID -->
        <app-card>
          <div class="pb-3 border-b border-surface-border flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <svg lucideServer class="w-4 h-4 text-opsAccent-cyan"></svg>
                <span>Monitoreo Continuo de Infraestructura Cloud AWS</span>
              </h3>
              <p class="text-xs text-opsText-muted mt-0.5">
                Estado operativo, latencias en milisegundos y métricas de disponibilidad de los componentes del backend.
              </p>
            </div>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AWS us-east-2 (Ohio)
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            @for (srv of operationsService.servicesHealth(); track srv.id) {
              <div class="p-3.5 rounded-xl bg-surface-canvas/80 border border-surface-border/70 hover:border-opsAccent-indigo/50 transition-all flex flex-col justify-between">
                <div>
                  <!-- Node header -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <span
                        class="w-2.5 h-2.5 rounded-full shrink-0"
                        [ngClass]="srv.estado === 'OPERACIONAL' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400 animate-pulse'"></span>
                      <h4 class="text-xs font-bold text-white truncate">{{ srv.nombre }}</h4>
                    </div>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded uppercase"
                          [ngClass]="srv.estado === 'OPERACIONAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'">
                      {{ srv.estado }}
                    </span>
                  </div>

                  <!-- Description -->
                  <p class="text-[11px] text-opsText-secondary mt-2 leading-relaxed">
                    {{ srv.descripcion }}
                  </p>
                </div>

                <!-- Footer metrics -->
                <div class="mt-4 pt-2 border-t border-surface-border/50 flex items-center justify-between text-xs font-mono">
                  <span class="text-opsText-muted text-[11px]">{{ srv.regionAws }}</span>
                  <div class="flex items-center gap-3">
                    <span class="font-bold" [ngClass]="srv.latenciaMs > 1000 ? 'text-amber-400' : 'text-emerald-400'">
                      {{ srv.latenciaMs }}ms
                    </span>
                    <span class="text-opsText-muted text-[10px]">
                      {{ srv.uptimeMensual }}%
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        </app-card>
      </div>
    }

      <!-- ========================================== -->
      <!-- TAB 2: AUDIT LOGS (logs_actividad)         -->
      <!-- ========================================== -->
      @if (activeTab() === 'AUDIT') {
        <div class="space-y-6">
          <!-- Filter & Search Bar -->
          <div class="bg-surface-card border border-surface-border rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <!-- Search -->
            <div class="relative flex-1 max-w-md">
              <svg lucideSearch class="w-4 h-4 text-opsText-muted absolute left-3 top-1/2 -translate-y-1/2"></svg>
              <input
                type="text"
                [ngModel]="operationsService.searchTerm()"
                (ngModelChange)="operationsService.searchTerm.set($event)"
                placeholder="Buscar en logs por usuario, IP, descripción o ID..."
                class="w-full bg-surface-canvas border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-opsText-muted focus:outline-none focus:border-opsAccent-indigo transition-colors" />
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex items-center gap-1.5">
                <svg lucideFilter class="w-3.5 h-3.5 text-opsText-muted"></svg>
                <select
                  [ngModel]="operationsService.filterTable()"
                  (ngModelChange)="operationsService.filterTable.set($event)"
                  class="bg-surface-canvas border border-surface-border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-opsAccent-indigo">
                  <option value="ALL">Todas las Tablas</option>
                  <option value="tickets">tickets</option>
                  <option value="clientes_saas">clientes_saas</option>
                  <option value="sugerencias_producto">sugerencias_producto</option>
                  <option value="comunicados_sistema">comunicados_sistema</option>
                  <option value="usuarios_sesiones">usuarios_sesiones</option>
                </select>
              </div>

              <div>
                <select
                  [ngModel]="operationsService.filterAction()"
                  (ngModelChange)="operationsService.filterAction.set($event)"
                  class="bg-surface-canvas border border-surface-border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-opsAccent-indigo">
                  <option value="ALL">Todas las Acciones</option>
                  <option value="INSERT">INSERT</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="STATUS_CHANGE">STATUS_CHANGE</option>
                  <option value="ESCALATE">ESCALATE</option>
                  <option value="LOGIN">LOGIN</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Logs Table -->
          <app-card>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr class="border-b border-surface-border text-opsText-muted font-medium uppercase text-[11px] tracking-wider bg-surface-canvas/40">
                    <th class="py-3 px-3 font-mono">ID</th>
                    <th class="py-3 px-3">Timestamp (UTC)</th>
                    <th class="py-3 px-3">Usuario Interno</th>
                    <th class="py-3 px-3 text-center">Acción</th>
                    <th class="py-3 px-3">Tabla Afectada</th>
                    <th class="py-3 px-3 text-center">Plataforma</th>
                    <th class="py-3 px-4">Descripción del Suceso</th>
                    <th class="py-3 px-3 text-center">Snapshot JSON</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-border/50 text-opsText-primary">
                  @for (log of operationsService.filteredAuditLogs(); track log.id) {
                    <tr class="hover:bg-surface-elevated/40 transition-colors">
                      <!-- ID -->
                      <td class="py-3 px-3 font-mono text-opsText-muted text-xs">
                        #{{ log.id }}
                      </td>

                      <!-- Timestamp -->
                      <td class="py-3 px-3 whitespace-nowrap font-mono text-xs text-opsText-muted">
                        {{ log.createdAt | date : 'dd/MM HH:mm:ss' }}
                      </td>

                      <!-- Usuario -->
                      <td class="py-3 px-3 whitespace-nowrap">
                        <div class="font-bold text-white text-xs">{{ log.usuarioNombre }}</div>
                        <div class="text-[10px] text-opsAccent-indigo font-mono">{{ log.usuarioRol }}</div>
                        <div class="text-[9px] text-opsText-muted font-mono">{{ log.ipOrigen }}</div>
                      </td>

                      <!-- Acción -->
                      <td class="py-3 px-3 text-center whitespace-nowrap">
                        <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                              [ngClass]="getActionBadgeClass(log.accion)">
                          {{ log.accion }}
                        </span>
                      </td>

                      <!-- Tabla & Registro -->
                      <td class="py-3 px-3 whitespace-nowrap font-mono text-xs">
                        <span class="text-opsAccent-cyan">{{ log.tablaAfectada }}</span>
                        <span class="text-opsText-muted"> (ID: {{ log.registroId }})</span>
                      </td>

                      <!-- Plataforma -->
                      <td class="py-3 px-3 text-center whitespace-nowrap">
                        <span class="inline-flex items-center gap-1 text-[11px] text-opsText-secondary">
                          @if (log.plataforma === 'ANGULAR_DESKTOP') {
                            <svg lucideMonitor class="w-3.5 h-3.5 text-opsAccent-indigo"></svg>
                            <span class="hidden sm:inline">Web</span>
                          } @else if (log.plataforma === 'REACT_NATIVE_MOBILE') {
                            <svg lucideSmartphone class="w-3.5 h-3.5 text-opsStatus-warning"></svg>
                            <span class="hidden sm:inline">Mobile</span>
                          } @else {
                            <svg lucideTerminal class="w-3.5 h-3.5 text-emerald-400"></svg>
                            <span class="hidden sm:inline">API</span>
                          }
                        </span>
                      </td>

                      <!-- Descripción -->
                      <td class="py-3 px-4 max-w-sm text-xs text-opsText-secondary">
                        {{ log.descripcion }}
                      </td>

                      <!-- Snapshot Modal Trigger -->
                      <td class="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          (click)="openSnapshotModal(log)"
                          class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-canvas border border-surface-border text-opsAccent-indigo hover:border-opsAccent-indigo text-xs font-mono transition-colors"
                          title="Ver Snapshot de datos antes y después">
                          <svg lucideFileCode class="w-3.5 h-3.5"></svg>
                          <span>JSON</span>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="py-8 text-center text-opsText-muted">
                        No se encontraron registros de auditoría que coincidan con la búsqueda.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </app-card>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: SNAPSHOT JSON DE AUDITORÍA          -->
      <!-- ========================================== -->
      @if (selectedLog(); as log) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-canvas/50">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-lg bg-opsAccent-indigo/10 text-opsAccent-indigo">
                  <svg lucideFileCode class="w-5 h-5"></svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-white flex items-center gap-2">
                    <span>Auditoría de Registro #{{ log.id }}</span>
                    <span class="font-mono text-xs px-2 py-0.5 rounded border" [ngClass]="getActionBadgeClass(log.accion)">
                      {{ log.accion }}
                    </span>
                  </h3>
                  <p class="text-xs text-opsText-muted font-mono">Tabla: {{ log.tablaAfectada }} (ID: {{ log.registroId }}) | {{ log.createdAt | date : 'medium' }}</p>
                </div>
              </div>
              <button
                (click)="closeSnapshotModal()"
                class="p-1 rounded-lg text-opsText-muted hover:text-white hover:bg-surface-border transition-colors">
                <svg lucideX class="w-5 h-5"></svg>
              </button>
            </div>

            <!-- Modal Content -->
            <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p class="text-xs text-opsText-secondary">
                <strong class="text-white">Descripción del suceso:</strong> {{ log.descripcion }}
              </p>
              <div class="text-[11px] text-opsText-muted font-mono flex items-center gap-4">
                <span>Operador: <strong class="text-white">{{ log.usuarioNombre }}</strong> ({{ log.usuarioRol }})</span>
                <span>IP: <strong class="text-white">{{ log.ipOrigen }}</strong></span>
                <span>Plataforma: <strong class="text-white">{{ log.plataforma }}</strong></span>
              </div>

              <!-- JSON Diffs -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <!-- Valores Anteriores -->
                <div>
                  <label class="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                    Valores Anteriores (Before)
                  </label>
                  <pre class="bg-surface-canvas border border-surface-border rounded-xl p-3 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-48 whitespace-pre-wrap">{{ formatJson(log.valoresAnterioresJson) }}</pre>
                </div>

                <!-- Valores Nuevos -->
                <div>
                  <label class="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Valores Nuevos (After)
                  </label>
                  <pre class="bg-surface-canvas border border-surface-border rounded-xl p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 whitespace-pre-wrap">{{ formatJson(log.valoresNuevosJson) }}</pre>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-3 border-t border-surface-border bg-surface-canvas/50 flex justify-end">
              <app-button variant="secondary" size="sm" (buttonClick)="closeSnapshotModal()">
                Cerrar Visor
              </app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class OperationsComponent implements OnInit {
  readonly operationsService = inject(OperationsService);

  readonly activeTab = signal<'SLA' | 'AUDIT'>('SLA');
  readonly isPinging = signal<boolean>(false);
  readonly selectedLog = signal<AuditLog | null>(null);

  ngOnInit(): void {
    this.operationsService.loadOperationsData().subscribe();
    this.operationsService.refreshHealth();
  }

  pingServices(): void {
    this.isPinging.set(true);
    this.operationsService.refreshHealth();
    setTimeout(() => {
      this.isPinging.set(false);
    }, 500);
  }

  openSnapshotModal(log: AuditLog): void {
    this.selectedLog.set(log);
  }

  closeSnapshotModal(): void {
    this.selectedLog.set(null);
  }

  formatJson(rawJson?: string): string {
    if (!rawJson) return '// Sin cambios registrados';
    try {
      const parsed = JSON.parse(rawJson);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return rawJson;
    }
  }

  getActionBadgeClass(action: AuditAction): string {
    switch (action) {
      case 'INSERT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'UPDATE':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'STATUS_CHANGE':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ESCALATE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'LOGIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  }
}
