export type AnnouncementType =
  | 'CAIDA_SERVICIO'
  | 'MANTENIMIENTO_PROGRAMADO'
  | 'COMUNICADO_OPERATIVO'
  | 'SEGURIDAD';

export interface SystemAnnouncement {
  id: number;
  tipo: AnnouncementType;
  titulo: string;
  mensaje: string;
  afectaServicio: boolean;
  publicadoPorNombre: string;
  publicadoPorRol: string;
  inicioEvento?: string;
  finEstimado?: string;
  createdAt: string;
}

export type ReleaseType = 'MAJOR' | 'MINOR' | 'PATCH';

export interface ChangelogRelease {
  id: number;
  versionTag: string; // e.g., 'v2.5.0'
  titulo: string;
  tipoRelease: ReleaseType;
  resumen: string;
  detalles: string[];
  redactadoPorNombre: string;
  fechaLanzamiento: string;
  createdAt: string;
}

export interface CreateAnnouncementDto {
  tipo: AnnouncementType;
  titulo: string;
  mensaje: string;
  afectaServicio: boolean;
  inicioEvento?: string;
  finEstimado?: string;
}
