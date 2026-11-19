import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { ClientService } from '../../core/services/client.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { AnnouncementService } from '../../core/services/announcement.service';
import { OperationsService } from '../../core/services/operations.service';
import { PriorityBadgeComponent } from '../../shared/components/badge/priority-badge.component';
import { StatusBadgeComponent } from '../../shared/components/badge/status-badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import {
  LucideLayers,
  LucideTicket,
  LucideBuilding2,
  LucideKanban,
  LucideShieldCheck,
  LucideTriangleAlert,
  LucideClock,
  LucideCheckCircle2,
  LucideExternalLink,
  LucideRefreshCw,
  LucidePlus,
  LucideServer,
  LucideActivity,
  LucideArrowUpRight,
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PriorityBadgeComponent,
    StatusBadgeComponent,
    ButtonComponent,
    CardComponent,
    LucideLayers,
    LucideTicket,
    LucideBuilding2,
    LucideKanban,
    LucideShieldCheck,
    LucideTriangleAlert,
    LucideClock,
    LucideCheckCircle2,
    LucideExternalLink,
    LucideRefreshCw,
    LucidePlus,
    LucideServer,
    LucideActivity,
    LucideArrowUpRight,
  ],
  template: `
    <div class="space-y-6">
      <!-- WELCOME & LIVE OVERVIEW HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <svg lucideLayers class="w-6 h-6 text-opsAccent-indigo"></svg>
              <span>Dashboard Ejecutivo & Operaciones en Vivo</span>
            </h1>
            <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-card border border-surface-border text-opsAccent-cyan">
              Turno Diurno Activo
            </span>
          </div>
          <p class="text-xs sm:text-sm text-opsText-muted mt-1">
            Métricas de SLA, incidentes transaccionales de Amazon RDS, demanda de producto y estado de la nube AWS.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <app-button
            variant="secondary"
            size="sm"
            [loading]="isRefreshing()"
            (buttonClick)="refreshAll()">
            <svg lucideRefreshCw class="w-3.5 h-3.5"></svg>
            <span>Sincronizar Cloud</span>
          </app-button>

          <app-button variant="primary" size="sm" routerLink="/tickets/new">
            <svg lucidePlus class="w-3.5 h-3.5"></svg>
            <span>+ Reportar Incidencia</span>
          </app-button>
        </div>
      </div>

      <!-- CRITICAL SYSTEM ALERT BANNER (If Active) -->
      @if (announcementService.activeServiceAlert(); as alert) {
        <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div class="flex items-start gap-3">
            <div class="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <svg lucideTriangleAlert class="w-5 h-5"></svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold font-mono px-1.5 py-0.2 rounded bg-rose-500 text-white uppercase">
                  Alerta Operativa
                </span>
                <h3 class="text-sm font-bold text-white">{{ alert.titulo }}</h3>
              </div>
              <p class="text-xs text-opsText-secondary mt-1 leading-relaxed">
                {{ alert.mensaje }}
              </p>
              <div class="mt-2 flex items-center gap-4 text-[11px] text-opsText-muted">
                <span>Publicado por: <strong class="text-white">{{ alert.publicadoPorNombre }}</strong></span>
                <span>Fin Estimado: <strong class="text-white">{{ alert.finEstimado ? (alert.finEstimado | date : 'shortTime') : 'Pendiente' }}</strong></span>
              </div>
            </div>
          </div>
          <button
            (click)="announcementService.dismissAlert(alert.id)"
            class="text-xs text-opsText-muted hover:text-white px-2 py-1 rounded hover:bg-surface-border transition-colors shrink-0">
            Descartar
          </button>
        </div>
      }

      <!-- 4 EXECUTIVE HIGH-LEVEL KPIS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1: Incidentes Activos & P1 Críticos -->
        <app-card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">Incidentes Activos</p>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-2xl font-bold font-mono text-white">{{ totalTickets() }}</span>
                <span class="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  {{ p1Count() }} P1 Críticos
                </span>
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-opsAccent-indigo/10 text-opsAccent-indigo border border-opsAccent-indigo/20">
              <svg lucideTicket class="w-5 h-5"></svg>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-opsText-muted pt-2 border-t border-surface-border/50">
            <span>{{ unassignedCount() }} sin asignar</span>
            <a routerLink="/tickets" class="text-opsAccent-indigo hover:underline flex items-center gap-1 font-medium">
              Ver tickets <svg lucideArrowUpRight class="w-3 h-3"></svg>
            </a>
          </div>
        </app-card>

        <!-- KPI 2: Cumplimiento Mensual SLA -->
        <app-card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">Cumplimiento SLA</p>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-2xl font-bold font-mono text-opsStatus-success">
                  {{ operationsService.overallSlaStats().complianceRate | number : '1.1-1' }}%
                </span>
                <span class="text-xs text-opsText-muted font-mono">Meta: 95.0%</span>
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-opsStatus-success/10 text-opsStatus-success border border-opsStatus-success/20">
              <svg lucideShieldCheck class="w-5 h-5"></svg>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-opsText-muted pt-2 border-t border-surface-border/50">
            <span>MTTR Promedio: <strong class="text-white">{{ operationsService.overallSlaStats().averageMttrHours | number : '1.1-1' }}h</strong></span>
            <a routerLink="/operations" class="text-opsStatus-success hover:underline flex items-center gap-1 font-medium">
              Detalle SLA <svg lucideArrowUpRight class="w-3 h-3"></svg>
            </a>
          </div>
        </app-card>

        <!-- KPI 3: Cartera SaaS en Monitoreo -->
        <app-card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">Cartera SaaS (ARR)</p>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-2xl font-bold font-mono text-emerald-400">
                  \${{ clientService.summaryMetrics().totalArr | number : '1.0-0' }}
                </span>
                <span class="text-xs text-opsText-muted font-mono">USD</span>
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <svg lucideBuilding2 class="w-5 h-5"></svg>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-opsText-muted pt-2 border-t border-surface-border/50">
            <span>{{ clientService.clients().length }} cuentas activas</span>
            <a routerLink="/clients" class="text-emerald-400 hover:underline flex items-center gap-1 font-medium">
              Directorio 360° <svg lucideArrowUpRight class="w-3 h-3"></svg>
            </a>
          </div>
        </app-card>

        <!-- KPI 4: Demanda Activa de Features -->
        <app-card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">Demanda de Producto</p>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-2xl font-bold font-mono text-opsAccent-cyan">
                  \${{ feedbackService.totalArrImpactActive() | number : '1.0-0' }}
                </span>
                <span class="text-xs text-opsText-muted font-mono">USD ARR</span>
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-opsAccent-cyan/10 text-opsAccent-cyan border border-opsAccent-cyan/20">
              <svg lucideKanban class="w-5 h-5"></svg>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-opsText-muted pt-2 border-t border-surface-border/50">
            <span>{{ feedbackService.inProgressArrImpact() > 0 ? '\$' + (feedbackService.inProgressArrImpact() | number : '1.0-0') + ' en sprint' : 'Planificando' }}</span>
            <a routerLink="/feedback" class="text-opsAccent-cyan hover:underline flex items-center gap-1 font-medium">
              Kanban <svg lucideArrowUpRight class="w-3 h-3"></svg>
            </a>
          </div>
        </app-card>
      </div>

      <!-- MIDDLE SECTION: CRITICAL INCIDENTS & HEALTH OF CLOUD INFRASTRUCTURE -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna 1 y 2: Incidentes Críticos que requieren atención -->
        <div class="lg:col-span-2 space-y-4">
          <app-card>
            <div class="flex items-center justify-between pb-3 border-b border-surface-border">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">
                  Incidentes Críticos & Bloqueantes (Prioridad P1 / P2)
                </h3>
              </div>
              <a routerLink="/tickets" class="text-xs text-opsAccent-indigo hover:underline flex items-center gap-1">
                Ver todos los tickets <svg lucideArrowUpRight class="w-3 h-3"></svg>
              </a>
            </div>

            <div class="divide-y divide-surface-border/50 mt-2">
              @for (ticket of criticalTickets(); track ticket.id) {
                <div class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-elevated/30 rounded-lg px-2 transition-colors">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <app-priority-badge [priority]="ticket.prioridad"></app-priority-badge>
                      <span class="font-mono text-xs font-bold text-white">#{{ ticket.codigo }}</span>
                      <span class="text-xs text-opsText-muted">({{ ticket.clienteNombre }})</span>
                    </div>
                    <p class="text-xs sm:text-sm font-medium text-white line-clamp-1">
                      {{ ticket.titulo }}
                    </p>
                    <div class="flex items-center gap-3 text-[11px] text-opsText-muted">
                      <span>Categoría: <strong class="text-opsText-secondary">{{ ticket.categoria }}</strong></span>
                      <span>Versión: <strong class="text-opsAccent-indigo font-mono">v{{ ticket.version }}</strong></span>
                      <span>Asignado: <strong class="text-white">{{ ticket.asignadoANombre || 'Sin asignar' }}</strong></span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <app-status-badge [status]="ticket.estado"></app-status-badge>
                    <a
                      [routerLink]="['/tickets', ticket.id]"
                      class="p-2 rounded-lg bg-surface-canvas border border-surface-border text-opsText-muted hover:text-white hover:border-opsAccent-indigo transition-colors"
                      title="Atender Incidente">
                      <svg lucideExternalLink class="w-4 h-4"></svg>
                    </a>
                  </div>
                </div>
              } @empty {
                <div class="py-8 text-center text-opsText-muted text-xs">
                  <svg lucideCheckCircle2 class="w-8 h-8 text-opsStatus-success mx-auto mb-2"></svg>
                  <p class="font-bold text-white">No hay incidentes críticos pendientes</p>
                  <p class="mt-0.5">Todos los servicios operan dentro de los parámetros de SLA.</p>
                </div>
              }
            </div>
          </app-card>

          <!-- ANALYTICAL METRICS: SEVERITY DISTRIBUTION & CATEGORIES -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Severidad Visual -->
            <app-card>
              <h4 class="text-xs font-bold uppercase tracking-wider text-opsText-muted mb-3 flex items-center justify-between">
                <span>Distribución por Severidad</span>
                <span class="text-opsAccent-indigo font-mono font-bold">{{ totalTickets() }} Total</span>
              </h4>
              <div class="space-y-2.5">
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-rose-400 font-medium">P1 Crítico ({{ p1Count() }})</span>
                    <span class="font-mono text-opsText-muted">{{ getPercent(p1Count()) }}%</span>
                  </div>
                  <div class="h-2 bg-surface-canvas rounded-full overflow-hidden border border-surface-border">
                    <div class="h-full bg-rose-500 rounded-full" [style.width.%]="getPercent(p1Count())"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-amber-400 font-medium">P2 Alta ({{ p2Count() }})</span>
                    <span class="font-mono text-opsText-muted">{{ getPercent(p2Count()) }}%</span>
                  </div>
                  <div class="h-2 bg-surface-canvas rounded-full overflow-hidden border border-surface-border">
                    <div class="h-full bg-amber-500 rounded-full" [style.width.%]="getPercent(p2Count())"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-sky-400 font-medium">P3 Media ({{ p3Count() }})</span>
                    <span class="font-mono text-opsText-muted">{{ getPercent(p3Count()) }}%</span>
                  </div>
                  <div class="h-2 bg-surface-canvas rounded-full overflow-hidden border border-surface-border">
                    <div class="h-full bg-sky-500 rounded-full" [style.width.%]="getPercent(p3Count())"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400 font-medium">P4 Baja ({{ p4Count() }})</span>
                    <span class="font-mono text-opsText-muted">{{ getPercent(p4Count()) }}%</span>
                  </div>
                  <div class="h-2 bg-surface-canvas rounded-full overflow-hidden border border-surface-border">
                    <div class="h-full bg-slate-500 rounded-full" [style.width.%]="getPercent(p4Count())"></div>
                  </div>
                </div>
              </div>
            </app-card>

            <!-- Categorías -->
            <app-card>
              <h4 class="text-xs font-bold uppercase tracking-wider text-opsText-muted mb-3 flex items-center justify-between">
                <span>Trazabilidad por Categoría</span>
                <span class="text-opsAccent-cyan font-mono font-bold">4 Frentes</span>
              </h4>
              <div class="space-y-3 text-xs">
                <div class="flex items-center justify-between p-2 rounded-lg bg-surface-canvas/60 border border-surface-border/50">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span class="text-white font-medium">Facturación SUNAT / OSE</span>
                  </div>
                  <span class="font-mono font-bold text-opsAccent-indigo">3 tickets</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-lg bg-surface-canvas/60 border border-surface-border/50">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span class="text-white font-medium">App Móvil POS Bluetooth</span>
                  </div>
                  <span class="font-mono font-bold text-amber-400">1 ticket</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-lg bg-surface-canvas/60 border border-surface-border/50">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="text-white font-medium">Pasarelas de Pago</span>
                  </div>
                  <span class="font-mono font-bold text-emerald-400">1 ticket</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-lg bg-surface-canvas/60 border border-surface-border/50">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span class="text-white font-medium">Autenticación & Sesión</span>
                  </div>
                  <span class="font-mono font-bold text-purple-400">1 ticket</span>
                </div>
              </div>
            </app-card>
          </div>
        </div>

        <!-- Columna 3: Estado de Servicios Cloud AWS & Actividad Reciente -->
        <div class="space-y-4">
          <!-- Cloud Health Card -->
          <app-card>
            <div class="flex items-center justify-between pb-3 border-b border-surface-border">
              <div class="flex items-center gap-2">
                <svg lucideServer class="w-4 h-4 text-opsAccent-cyan"></svg>
                <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                  Salud de Infraestructura AWS
                </h3>
              </div>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                99.98% SLA
              </span>
            </div>

            <div class="space-y-2.5 mt-3">
              @for (srv of operationsService.servicesHealth(); track srv.id) {
                <div class="p-2.5 rounded-lg bg-surface-canvas/80 border border-surface-border/60 flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span
                        class="w-2 h-2 rounded-full shrink-0"
                        [ngClass]="srv.estado === 'OPERACIONAL' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'"></span>
                      <p class="text-xs font-semibold text-white truncate">{{ srv.nombre }}</p>
                    </div>
                    <p class="text-[10px] text-opsText-muted truncate mt-0.5">{{ srv.regionAws }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-xs font-mono font-bold" [ngClass]="srv.latenciaMs > 1000 ? 'text-amber-400' : 'text-emerald-400'">
                      {{ srv.latenciaMs }}ms
                    </span>
                    <p class="text-[9px] text-opsText-muted">{{ srv.estado }}</p>
                  </div>
                </div>
              }
            </div>

            <div class="mt-4 pt-3 border-t border-surface-border/50 text-center">
              <a routerLink="/operations" class="text-xs text-opsAccent-indigo hover:underline flex items-center justify-center gap-1">
                <svg lucideActivity class="w-3.5 h-3.5"></svg>
                <span>Ver métricas detalladas y logs de auditoría</span>
              </a>
            </div>
          </app-card>

          <!-- Quick Shift / Guard Handover Card -->
          <app-card>
            <div class="flex items-center gap-2 mb-2">
              <div class="p-1.5 rounded-lg bg-opsAccent-indigo/10 text-opsAccent-indigo">
                <svg lucideClock class="w-4 h-4"></svg>
              </div>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider">
                Turno de Guardia OpsHub
              </h4>
            </div>
            <p class="text-xs text-opsText-secondary leading-relaxed">
              Guardia técnica activa a cargo de <strong>Aldair (Tech Lead)</strong> y <strong>Henry (Soporte L2)</strong>.
              Próximo relevo programado a las 18:00 UTC.
            </p>
            <div class="mt-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-[11px] font-mono text-emerald-400">Canal SSE EventStream Conectado</span>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly ticketService = inject(TicketService);
  readonly clientService = inject(ClientService);
  readonly feedbackService = inject(FeedbackService);
  readonly announcementService = inject(AnnouncementService);
  readonly operationsService = inject(OperationsService);

  readonly isRefreshing = signal<boolean>(false);

  ngOnInit(): void {
    this.refreshAll();
  }

  // Computed signals para métricas de tickets
  readonly totalTickets = computed(() => this.ticketService.tickets().length);
  readonly p1Count = computed(() => this.ticketService.tickets().filter((t) => t.prioridad === 'P1').length);
  readonly p2Count = computed(() => this.ticketService.tickets().filter((t) => t.prioridad === 'P2').length);
  readonly p3Count = computed(() => this.ticketService.tickets().filter((t) => t.prioridad === 'P3').length);
  readonly p4Count = computed(() => this.ticketService.tickets().filter((t) => t.prioridad === 'P4').length);
  readonly unassignedCount = computed(() => this.ticketService.tickets().filter((t) => !t.asignadoAId).length);

  // Tickets P1/P2 críticos
  readonly criticalTickets = computed(() => {
    return this.ticketService
      .tickets()
      .filter((t) => t.prioridad === 'P1' || t.prioridad === 'P2')
      .slice(0, 4);
  });

  getPercent(count: number): number {
    const total = this.totalTickets();
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  refreshAll(): void {
    this.isRefreshing.set(true);
    this.ticketService.getTickets().subscribe();
    this.clientService.getClients().subscribe();
    this.feedbackService.loadSuggestions().subscribe();
    this.announcementService.loadAnnouncements().subscribe();
    this.operationsService.loadOperationsData().subscribe();
    this.operationsService.refreshHealth();
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }
}
