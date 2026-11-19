import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import {
  AuditLog,
  ServiceHealth,
  SlaMetric,
} from '../models/operations.model';
import {
  DEMO_AUDIT_LOGS,
  DEMO_SERVICES_HEALTH,
  DEMO_SLA_METRICS,
} from '../data/demo-operations.data';
import { environment } from '../../../environments/environment';

const AUDIT_STORAGE_KEY = 'opshub_audit_logs';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  private http = inject(HttpClient);

  private auditLogsSignal = signal<AuditLog[]>(this.getStoredAuditLogs());
  private slaMetricsSignal = signal<SlaMetric[]>(DEMO_SLA_METRICS);
  private servicesHealthSignal = signal<ServiceHealth[]>(DEMO_SERVICES_HEALTH);

  // Filters for Audit Logs
  readonly filterTable = signal<string>('ALL');
  readonly filterAction = signal<string>('ALL');
  readonly searchTerm = signal<string>('');

  // Public readonly signals
  readonly auditLogs = this.auditLogsSignal.asReadonly();
  readonly slaMetrics = this.slaMetricsSignal.asReadonly();
  readonly servicesHealth = this.servicesHealthSignal.asReadonly();

  // Computed: Audit Logs filtrados
  readonly filteredAuditLogs = computed(() => {
    let list = this.auditLogsSignal();
    const table = this.filterTable();
    const action = this.filterAction();
    const term = this.searchTerm().trim().toLowerCase();

    if (table !== 'ALL') {
      list = list.filter((log) => log.tablaAfectada === table);
    }

    if (action !== 'ALL') {
      list = list.filter((log) => log.accion === action);
    }

    if (term) {
      list = list.filter(
        (log) =>
          log.descripcion.toLowerCase().includes(term) ||
          log.usuarioNombre.toLowerCase().includes(term) ||
          log.ipOrigen.includes(term) ||
          log.registroId.toString().includes(term)
      );
    }

    return list;
  });

  // Overall SLA Compliance calculation
  readonly overallSlaStats = computed(() => {
    const list = this.slaMetricsSignal();
    const totalTickets = list.reduce((sum, m) => sum + m.totalTickets, 0);
    const ticketsInSla = list.reduce((sum, m) => sum + m.ticketsEnSla, 0);
    const breached = list.reduce((sum, m) => sum + m.ticketsFueraSla, 0);
    const avgCompliance =
      totalTickets > 0 ? (ticketsInSla / totalTickets) * 100 : 100;
    const avgMttr =
      list.length > 0
        ? list.reduce((sum, m) => sum + m.mttrHorasPromedio, 0) / list.length
        : 0;

    return {
      totalTickets,
      ticketsInSla,
      breached,
      complianceRate: avgCompliance,
      averageMttrHours: avgMttr,
    };
  });

  // Health Stats
  readonly systemStatusSummary = computed(() => {
    const services = this.servicesHealthSignal();
    const total = services.length;
    const operational = services.filter(
      (s) => s.estado === 'OPERACIONAL'
    ).length;
    const degraded = services.filter((s) => s.estado === 'DEGRADADO').length;
    const maintenance = services.filter(
      (s) => s.estado === 'MANTENIMIENTO'
    ).length;

    return {
      total,
      operational,
      degraded,
      maintenance,
      allHealthy: degraded === 0 && maintenance === 0,
    };
  });

  constructor() {
    if (this.auditLogsSignal().length === 0) {
      this.saveAuditLogs(DEMO_AUDIT_LOGS);
    }
  }

  /**
   * Carga métricas y logs de auditoría desde el backend (GET /api/v1/operations/...)
   */
  loadOperationsData(): Observable<any> {
    const auditUrl = `${environment.apiUrl}/operations/audit`;
    const slaUrl = `${environment.apiUrl}/operations/metrics/sla`;

    return forkJoin({
      audit: this.http.get<any>(auditUrl).pipe(catchError(() => of(null))),
      sla: this.http.get<any>(slaUrl).pipe(catchError(() => of(null))),
    }).pipe(
      map((res) => {
        if (res.audit?.data && Array.isArray(res.audit.data) && res.audit.data.length > 0) {
          const mapped: AuditLog[] = res.audit.data.map((log: any) => ({
            id: log.id,
            usuarioNombre: log.usuarioNombre || 'Operador',
            usuarioRol: log.usuarioRol || 'ADMIN',
            accion: log.accion || 'UPDATE',
            tablaAfectada: log.tablaAfectada || 'tickets',
            registroId: log.registroId || 1,
            ipOrigen: log.ipOrigen || '190.237.45.12',
            plataforma: log.plataforma || 'ANGULAR_DESKTOP',
            descripcion: log.descripcion || 'Acción del sistema',
            valoresAnterioresJson: log.valoresAnterioresJson,
            valoresNuevosJson: log.valoresNuevosJson,
            createdAt: log.createdAt || new Date().toISOString(),
          }));
          this.saveAuditLogs(mapped);
          this.auditLogsSignal.set(mapped);
        }

        if (res.sla?.data?.desglosePorPlan && Array.isArray(res.sla.data.desglosePorPlan) && res.sla.data.desglosePorPlan.length > 0) {
          const mappedSla: SlaMetric[] = res.sla.data.desglosePorPlan.map((p: any) => ({
            planNombre: p.planNombre,
            planCodigo: p.planCodigo,
            totalTickets: p.totalTickets,
            ticketsEnSla: p.ticketsEnSla,
            ticketsFueraSla: p.ticketsFueraSla,
            porcentajeCumplimiento: p.porcentajeCumplimiento,
            slaHorasObjetivo: p.slaHorasObjetivo,
            mttrHorasPromedio: p.mttrHorasPromedio,
          }));
          this.slaMetricsSignal.set(mappedSla);
        }

        return { auditLogs: this.auditLogsSignal(), slaMetrics: this.slaMetricsSignal() };
      })
    );
  }

  /**
   * Realiza un ping en vivo al backend para verificar conectividad y actualizar telemetría
   */
  refreshHealth(): void {
    const healthUrl = `${environment.apiUrl}/health`;
    const start = Date.now();

    this.http.get<any>(healthUrl).pipe(
      catchError(() => of(null))
    ).subscribe((res) => {
      const latency = Math.max(8, Date.now() - start);

      if (res?.data?.services && Array.isArray(res.data.services) && res.data.services.length > 0) {
        const mappedServices: ServiceHealth[] = res.data.services.map((s: any) => ({
          id: s.id,
          nombre: s.nombre,
          categoria: s.categoria,
          estado: s.estado,
          latenciaMs: s.id === 'lambda-api' ? latency : s.latenciaMs,
          regionAws: s.regionAws,
          uptimeMensual: s.uptimeMensual,
          descripcion: s.descripcion,
        }));
        this.servicesHealthSignal.set(mappedServices);
        return;
      }

      this.servicesHealthSignal.update((services) =>
        services.map((s) => {
          if (s.id === 'lambda-api') {
            return {
              ...s,
              latenciaMs: latency,
              estado: res ? 'OPERACIONAL' : 'DEGRADADO',
            };
          }
          if (s.id === 'rds-mysql' && res?.data?.database) {
            return {
              ...s,
              estado: res.data.database.isReachable ? 'OPERACIONAL' : 'DEGRADADO',
              latenciaMs: res.data.database.latencyMs || s.latenciaMs,
            };
          }
          const jitter = Math.floor(Math.random() * 6) - 3;
          return {
            ...s,
            latenciaMs: Math.max(8, s.latenciaMs + jitter),
          };
        })
      );
    });
  }

  private getStoredAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(AUDIT_STORAGE_KEY);
      return data ? JSON.parse(data) : DEMO_AUDIT_LOGS;
    } catch {
      return DEMO_AUDIT_LOGS;
    }
  }

  private saveAuditLogs(items: AuditLog[]): void {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }
}
