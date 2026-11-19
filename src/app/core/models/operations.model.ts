export type AuditAction =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'ESCALATE'
  | 'STATUS_CHANGE';

export type AuditTable =
  | 'tickets'
  | 'clientes_saas'
  | 'sugerencias_producto'
  | 'comunicados_sistema'
  | 'usuarios_sesiones';

export interface AuditLog {
  id: number;
  usuarioNombre: string;
  usuarioRol: string;
  accion: AuditAction;
  tablaAfectada: AuditTable;
  registroId: number;
  ipOrigen: string;
  plataforma: 'ANGULAR_DESKTOP' | 'REACT_NATIVE_MOBILE' | 'API_GATEWAY_CLI';
  descripcion: string;
  valoresAnterioresJson?: string;
  valoresNuevosJson?: string;
  createdAt: string;
}

export interface SlaMetric {
  planNombre: string;
  planCodigo: string;
  totalTickets: number;
  ticketsEnSla: number;
  ticketsFueraSla: number;
  porcentajeCumplimiento: number;
  slaHorasObjetivo: number;
  mttrHorasPromedio: number;
}

export type HealthStatus = 'OPERACIONAL' | 'DEGRADADO' | 'MANTENIMIENTO';

export interface ServiceHealth {
  id: string;
  nombre: string;
  categoria: 'BASE_DATOS' | 'COMPUTO' | 'ALMACENAMIENTO' | 'CDN_RED' | 'TIEMPO_REAL';
  estado: HealthStatus;
  latenciaMs: number;
  regionAws: string;
  uptimeMensual: number;
  descripcion: string;
}
