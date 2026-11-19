export type SubscriptionPlanCode =
  | 'STARTER'
  | 'PROFESSIONAL'
  | 'ENTERPRISE'
  | 'CUSTOM';

export type AccountStatus = 'ACTIVO' | 'EN_RIESGO' | 'SUSPENDIDO';

export type ChurnRiskLevel = 'BAJO' | 'MEDIO' | 'ALTO';

export type ClientNoteType =
  | 'GENERAL'
  | 'RENOVACION'
  | 'RIESGO_CHURN'
  | 'SOPORTE_CRITICO';

export interface SubscriptionPlan {
  id: number;
  codigo: SubscriptionPlanCode;
  nombre: string;
  precioMensual: number;
  limiteUsuarios: number;
  slaHorasResolucion: number;
}

export interface ClientContact {
  id: number;
  clienteId: number;
  nombre: string;
  cargo: string;
  email: string;
  telefono: string;
  esPrincipal: boolean;
}

export interface ClientNote {
  id: number;
  clienteId: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioRol: string;
  tipoNota: ClientNoteType;
  nota: string;
  createdAt: string;
}

export interface ClientSaas {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  planId: number;
  planCodigo: SubscriptionPlanCode;
  planNombre: string;
  montoAnualContratado: number; // ARR en USD
  estadoCuenta: AccountStatus;
  fechaRegistro: string;
  direccionFiscal: string;
  
  // Métricas calculadas para la Ficha 360°
  totalTickets?: number;
  churnRisk: ChurnRiskLevel;
  healthScore: number; // 0 a 100
  csatAverage: number; // 1 a 5 estrellas
  
  // Relaciones
  contactos: ClientContact[];
  notas: ClientNote[];
}
