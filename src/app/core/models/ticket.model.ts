export type TicketPriority = 'P1' | 'P2' | 'P3' | 'P4';

export type TicketStatus =
  | 'NUEVO'
  | 'EN_DIAGNOSTICO'
  | 'EN_DESARROLLO'
  | 'EN_QA'
  | 'RESUELTO'
  | 'CERRADO';

export type TicketCategory =
  | 'FIRMA_ELECTRONICA'
  | 'BASE_DE_DATOS'
  | 'AUTENTICACION'
  | 'IMPRESION'
  | 'API'
  | 'OTRO';

export interface TicketAttachment {
  id: number;
  nombreArchivo: string;
  urlS3: string;
  mimeType: string;
  tamanioBytes: number;
  createdAt: string;
}

export interface TicketComment {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  comentario: string;
  esPrivadoTi: boolean;
  createdAt: string;
}

export interface TicketEscalation {
  id: number;
  escaladoPorNombre: string;
  asignadoANombre: string;
  motivoEscalacion: string;
  diagnosticoInicial?: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  clienteId: number;
  clienteNombre: string;
  clienteRuc: string;
  clientePlan: string;
  telefonoContacto: string;
  prioridad: TicketPriority;
  prioridadNombre: string;
  estado: TicketStatus;
  estadoNombre: string;
  categoria: TicketCategory;
  categoriaNombre: string;
  reportadoPorId: number;
  reportadoPorNombre: string;
  asignadoAId?: number;
  asignadoANombre?: string;
  canalOrigen: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  fechaCierre?: string;
  comentarios: TicketComment[];
  adjuntos: TicketAttachment[];
  escalaciones: TicketEscalation[];
}

export interface CreateTicketRequest {
  clienteId: number;
  categoriaId: number;
  prioridadId: number;
  titulo: string;
  descripcion: string;
  telefonoContacto: string;
  canalOrigen?: string;
}

export interface UpdateTicketStatusRequest {
  nuevoEstado: TicketStatus;
  currentVersion: number;
  comentario?: string;
}

export interface EscalateTicketRequest {
  asignadoAId: number;
  motivoEscalacion: string;
  diagnosticoInicial?: string;
  currentVersion: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  s3Key: string;
  expiresInMinutes: number;
}
