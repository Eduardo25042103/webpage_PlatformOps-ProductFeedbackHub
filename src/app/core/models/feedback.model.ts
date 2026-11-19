export type SuggestionStatus =
  | 'EVALUACION'
  | 'EN_ROADMAP'
  | 'EN_DESARROLLO'
  | 'DESCARTADA'
  | 'LANZADA';

export type SuggestionCategory =
  | 'FACTURACION_SUNAT'
  | 'INTEGRACIONES'
  | 'REPORTES_PLE'
  | 'MOBILE_POS'
  | 'SEGURIDAD_UX'
  | 'INFRAESTRUCTURA';

export type SuggestionEffort = 'BAJO' | 'MEDIO' | 'ALTO' | 'MUY_ALTO';

export interface RequestingClientInfo {
  clienteId: number;
  razonSocial: string;
  planCodigo: string;
  arrUsd: number;
}

export interface ProductSuggestion {
  id: number;
  codigo: string; // e.g., 'SUG-2026-001'
  titulo: string;
  descripcion: string;
  categoria: SuggestionCategory;
  estado: SuggestionStatus;
  votosCount: number;
  montoTotalArrImpactoUsd: number;
  esfuerzoEstimado: SuggestionEffort;
  scoreRice: number; // Índice RICE calculado (0 a 100)
  clientesSolicitantes: RequestingClientInfo[];
  responsableDev?: string;
  releaseVersion?: string;
  createdAt: string;
  updatedAt: string;
  haVotadoUsuarioActual?: boolean;
}

export interface CreateSuggestionDto {
  titulo: string;
  descripcion: string;
  categoria: SuggestionCategory;
  esfuerzoEstimado: SuggestionEffort;
  clienteId?: number;
}

export interface KanbanColumn {
  id: SuggestionStatus;
  title: string;
  badgeClass: string;
  headerBorder: string;
}
