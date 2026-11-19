import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import {
  CreateTicketRequest,
  EscalateTicketRequest,
  Ticket,
  TicketAttachment,
  TicketCategory,
  TicketComment,
  TicketPriority,
  TicketStatus,
  UpdateTicketStatusRequest,
} from '../models/ticket.model';
import { INITIAL_TICKETS } from './demo-tickets.data';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'opshub_tickets_data';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Signals de estado reactivo
  readonly tickets = signal<Ticket[]>(this.getStoredTickets());
  readonly selectedTicket = signal<Ticket | null>(null);

  // Signals de filtros reactivos
  readonly filterPriority = signal<string>('ALL');
  readonly filterStatus = signal<string>('ALL');
  readonly searchTerm = signal<string>('');

  // Computed signal con filtros y búsqueda reactiva
  readonly filteredTickets = computed(() => {
    let list = this.tickets();

    const priority = this.filterPriority();
    if (priority !== 'ALL') {
      list = list.filter((t) => t.prioridad === priority);
    }

    const status = this.filterStatus();
    if (status !== 'ALL') {
      list = list.filter((t) => t.estado === status);
    }

    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(
        (t) =>
          t.codigo.toLowerCase().includes(term) ||
          t.titulo.toLowerCase().includes(term) ||
          t.clienteNombre.toLowerCase().includes(term) ||
          (t.asignadoANombre && t.asignadoANombre.toLowerCase().includes(term))
      );
    }

    return list;
  });

  // Estadísticas reactivas calculadas
  readonly stats = computed(() => {
    const list = this.tickets();
    return {
      totalOpen: list.filter((t) => t.estado !== 'RESUELTO' && t.estado !== 'CERRADO').length,
      p1Critical: list.filter((t) => t.prioridad === 'P1').length,
      assignedToMe: list.filter((t) => {
        const currentUser = this.authService.currentUser();
        if (!currentUser) return false;
        return t.asignadoAId === currentUser.id;
      }).length,
      resolvedCount: list.filter((t) => t.estado === 'RESUELTO' || t.estado === 'CERRADO').length,
    };
  });

  constructor() {
    if (this.tickets().length === 0) {
      this.saveTickets(INITIAL_TICKETS);
    }
  }

  /**
   * Obtiene la lista de incidentes desde el API Gateway (.NET 10 / AWS Lambda).
   * Si la llamada tiene éxito, actualiza la Signal reactiva y la caché local.
   * Si el backend está apagado o no responde, devuelve los datos en memoria.
   */
  getTickets(): Observable<Ticket[]> {
    const url = `${environment.apiUrl}/tickets`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const rawList = res?.data || (Array.isArray(res) ? res : null);
        if (rawList && Array.isArray(rawList) && rawList.length > 0) {
          const mapped: Ticket[] = rawList.map((item: any) => this.mapBackendTicket(item));
          this.saveTickets(mapped);
          return mapped;
        }
        return this.tickets();
      }),
      catchError(() => {
        return of(this.tickets());
      })
    );
  }

  /**
   * Obtiene un ticket específico por ID desde el backend.
   */
  getTicketById(id: number): Observable<Ticket> {
    const url = `${environment.apiUrl}/tickets/${id}`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const item = res?.data || res;
        if (item && item.id) {
          const mapped = this.mapBackendTicket(item);
          this.selectedTicket.set(mapped);
          // Actualizar en la lista local si existe
          this.tickets.update((list) => list.map((t) => (t.id === mapped.id ? mapped : t)));
          return mapped;
        }
        return this.getTicketLocal(id);
      }),
      catchError(() => {
        return of(this.getTicketLocal(id));
      })
    );
  }

  /**
   * Creación de incidente: envía POST a /api/v1/tickets
   */
  createTicket(req: CreateTicketRequest): Observable<Ticket> {
    const url = `${environment.apiUrl}/tickets`;

    const payload = {
      clienteId: req.clienteId,
      categoriaId: req.categoriaId,
      prioridadId: req.prioridadId,
      titulo: req.titulo,
      descripcion: req.descripcion,
      telefonoContacto: req.telefonoContacto,
      canalOrigen: 'WEB',
    };

    return this.http.post<any>(url, payload).pipe(
      map((res) => {
        const item = res?.data || res;
        const newTicket = this.mapBackendTicket(item);
        this.saveTickets([newTicket, ...this.tickets()]);
        return newTicket;
      }),
      catchError(() => {
        // Fallback local garantizado para modo demostración
        return of(this.createTicketLocal(req));
      })
    );
  }

  /**
   * ACTUALIZACIÓN CON BLOQUEO OPTIMISTA (OPTIMISTIC LOCKING)
   * Envía PUT a /api/v1/tickets/{id}/status con currentVersion.
   * Si el backend detecta versión desfasada, arroja HTTP 409 Conflict.
   */
  updateTicketStatus(id: number, req: UpdateTicketStatusRequest): Observable<Ticket> {
    const url = `${environment.apiUrl}/tickets/${id}/status`;

    const statusIdMap: Record<TicketStatus, number> = {
      NUEVO: 1,
      EN_DIAGNOSTICO: 2,
      EN_DESARROLLO: 3,
      EN_QA: 4,
      RESUELTO: 5,
      CERRADO: 6,
    };

    const payload = {
      nuevoEstadoId: statusIdMap[req.nuevoEstado] || 1,
      currentVersion: req.currentVersion,
      comentario: req.comentario,
    };

    return this.http.put<any>(url, payload).pipe(
      map((res) => {
        const item = res?.data || res;
        const updated = this.mapBackendTicket(item);
        const list = this.tickets().map((t) => (t.id === id ? updated : t));
        this.saveTickets(list);
        this.selectedTicket.set(updated);
        return updated;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 409) {
          // Propagar para abrir ConflictDialogComponent
          return throwError(() => error);
        }
        // Fallback local con validación de versión
        return this.updateTicketStatusLocal(id, req);
      })
    );
  }

  /**
   * ESCALACIÓN FORMAL A DESARROLLO (POST /api/v1/tickets/{id}/escalate)
   */
  escalateTicket(id: number, req: EscalateTicketRequest): Observable<Ticket> {
    const url = `${environment.apiUrl}/tickets/${id}/escalate`;

    const payload = {
      asignadoAId: req.asignadoAId,
      motivoEscalacion: req.motivoEscalacion,
      diagnosticoInicial: req.diagnosticoInicial,
      currentVersion: req.currentVersion,
    };

    return this.http.post<any>(url, payload).pipe(
      map((res) => {
        const item = res?.data || res;
        const updated = this.mapBackendTicket(item);
        const list = this.tickets().map((t) => (t.id === id ? updated : t));
        this.saveTickets(list);
        this.selectedTicket.set(updated);
        return updated;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 409) {
          return throwError(() => error);
        }
        return this.escalateTicketLocal(id, req);
      })
    );
  }

  /**
   * AGREGAR COMENTARIO TÉCNICO (POST /api/v1/tickets/{id}/comments)
   */
  addComment(id: number, comentario: string, esPrivadoTi: boolean = false): Observable<Ticket> {
    const url = `${environment.apiUrl}/tickets/${id}/comments`;

    const payload = {
      comentario,
      esPrivadoTi,
    };

    return this.http.post<any>(url, payload).pipe(
      map((res) => {
        const commentData = res?.data;
        const list = this.tickets();
        const ticket = list.find((t) => t.id === id);
        if (ticket) {
          const user = this.authService.currentUser();
          const newComment: TicketComment = {
            id: commentData?.id || Date.now(),
            usuarioId: user?.id || 1,
            usuarioNombre: user ? `${user.nombre} ${user.apellido}` : 'Usuario Interno',
            comentario,
            esPrivadoTi,
            createdAt: commentData?.createdAt || new Date().toISOString(),
          };
          const updated: Ticket = {
            ...ticket,
            comentarios: [...ticket.comentarios, newComment],
          };
          const updatedList = list.map((t) => (t.id === id ? updated : t));
          this.saveTickets(updatedList);
          this.selectedTicket.set(updated);
          return updated;
        }
        return this.getTicketLocal(id);
      }),
      catchError(() => {
        return this.addCommentLocal(id, comentario, esPrivadoTi);
      })
    );
  }

  /**
   * Refresca la lista de tickets invocando el backend
   */
  refreshTickets(): void {
    this.getTickets().subscribe();
  }

  /**
   * Sube un archivo adjunto para el ticket (POST /api/v1/tickets/{id}/attachments)
   */
  uploadAttachment(ticketId: number, file: File): Observable<Ticket> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environment.apiUrl}/tickets/${ticketId}/attachments`;

    return this.http.post<any>(url, formData).pipe(
      map((res) => {
        const item = res?.data || res;
        if (item && item.id) {
          const updated = this.mapBackendTicket(item);
          this.saveTickets(this.tickets().map((t) => (t.id === ticketId ? updated : t)));
          this.selectedTicket.set(updated);
          return updated;
        }
        return this.uploadAttachmentLocal(ticketId, file);
      }),
      catchError(() => of(this.uploadAttachmentLocal(ticketId, file)))
    );
  }

  /**
   * Elimina un ticket por su identificador (DELETE /api/v1/tickets/{id})
   */
  deleteTicket(id: number): Observable<boolean> {
    const url = `${environment.apiUrl}/tickets/${id}`;
    return this.http.delete<any>(url).pipe(
      map(() => {
        this.saveTickets(this.tickets().filter((t) => t.id !== id));
        if (this.selectedTicket()?.id === id) {
          this.selectedTicket.set(null);
        }
        return true;
      }),
      catchError(() => {
        this.saveTickets(this.tickets().filter((t) => t.id !== id));
        if (this.selectedTicket()?.id === id) {
          this.selectedTicket.set(null);
        }
        return of(true);
      })
    );
  }

  /**
   * Simula que otro usuario modificó el ticket en el backend,
   * incrementando la versión en la base de datos para forzar un error 409.
   */
  simulateExternalConflict(id: number): void {
    const list = this.tickets();
    const index = list.findIndex((t) => t.id === id);
    if (index !== -1) {
      const ticket = list[index];
      const conflictTicket: Ticket = {
        ...ticket,
        version: ticket.version + 1,
        estado: 'EN_DESARROLLO',
        estadoNombre: 'En Desarrollo',
        updatedAt: new Date().toISOString(),
        comentarios: [
          ...ticket.comentarios,
          {
            id: Date.now(),
            usuarioId: 99,
            usuarioNombre: 'Aldair (Tech Lead - Modificación Concurrente)',
            comentario: 'Tomando el incidente en paralelo para investigación con AWS CloudWatch.',
            esPrivadoTi: true,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const updatedList = [...list];
      updatedList[index] = conflictTicket;
      this.saveTickets(updatedList);
      this.selectedTicket.set(conflictTicket);
    }
  }

  // --- Mapeo de respuesta de API a modelo frontend ---
  private mapBackendTicket(item: any): Ticket {
    return {
      id: item.id,
      codigo: item.codigo,
      titulo: item.titulo,
      descripcion: item.descripcion || '',
      clienteId: item.clienteId || 1,
      clienteNombre: item.clienteNombre || 'Cliente Corporativo SaaS',
      clienteRuc: item.clienteRuc || '20500011223',
      clientePlan: item.clientePlan || 'ENTERPRISE',
      telefonoContacto: item.telefonoContacto || '999888777',
      prioridad: (item.prioridadCodigo || item.prioridad || 'P1') as TicketPriority,
      prioridadNombre: item.prioridadNombre || 'P1 Crítica',
      estado: (item.estadoCodigo || item.estado || 'NUEVO') as TicketStatus,
      estadoNombre: item.estadoNombre || 'Nuevo',
      categoria: (item.categoriaCodigo || item.categoria || 'BASE_DE_DATOS') as TicketCategory,
      categoriaNombre: item.categoriaNombre || 'General',
      reportadoPorId: item.reportadoPorId || 1,
      reportadoPorNombre: item.reportadoPorNombre || 'Operador',
      canalOrigen: item.canalOrigen || 'WEB_ANGULAR',
      version: item.version || 1,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      fechaCierre: item.fechaCierre,
      comentarios: item.comentarios || [],
      adjuntos: item.adjuntos || [],
      escalaciones: item.escalaciones || [],
    };
  }

  // --- Implementaciones de contingencia local para modo offline ---
  private getTicketLocal(id: number): Ticket {
    const found = this.tickets().find((t) => t.id === id);
    if (!found) {
      throw new Error(`Ticket con ID ${id} no encontrado`);
    }
    this.selectedTicket.set(found);
    return found;
  }

  private createTicketLocal(req: CreateTicketRequest): Ticket {
    const currentList = this.tickets();
    const nextId = currentList.length > 0 ? Math.max(...currentList.map((t) => t.id)) + 1 : 1;
    const codigo = `INC-2026-${String(nextId).padStart(4, '0')}`;
    const user = this.authService.currentUser();

    const newTicket: Ticket = {
      id: nextId,
      codigo,
      titulo: req.titulo,
      descripcion: req.descripcion,
      clienteId: req.clienteId,
      clienteNombre: 'Cliente Corporativo SaaS',
      clienteRuc: '20500011223',
      clientePlan: 'ENTERPRISE',
      telefonoContacto: req.telefonoContacto,
      prioridad: req.prioridadId === 1 ? 'P1' : req.prioridadId === 2 ? 'P2' : 'P3',
      prioridadNombre: req.prioridadId === 1 ? 'P1 Crítica' : 'P2 Alta',
      estado: 'NUEVO',
      estadoNombre: 'Nuevo',
      categoria: 'BASE_DE_DATOS',
      categoriaNombre: 'Base de Datos',
      reportadoPorId: user?.id || 1,
      reportadoPorNombre: user ? `${user.nombre} ${user.apellido}` : 'Henry Monroy',
      canalOrigen: 'WEB_ANGULAR',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comentarios: [],
      adjuntos: [],
      escalaciones: [],
    };

    this.saveTickets([newTicket, ...currentList]);
    return newTicket;
  }

  private updateTicketStatusLocal(id: number, req: UpdateTicketStatusRequest): Observable<Ticket> {
    const list = this.tickets();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return throwError(() => new Error('Ticket no encontrado'));

    const currentTicket = list[index];

    if (req.currentVersion !== currentTicket.version) {
      const conflictError = new HttpErrorResponse({
        error: {
          success: false,
          message: `Conflicto de concurrencia: El ticket ${currentTicket.codigo} fue modificado por otro operador.`,
          serverVersion: currentTicket.version,
          clientVersion: req.currentVersion,
        },
        status: 409,
        statusText: 'Conflict',
      });
      return throwError(() => conflictError);
    }

    const updated: Ticket = {
      ...currentTicket,
      estado: req.nuevoEstado,
      version: currentTicket.version + 1,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [...list];
    updatedList[index] = updated;
    this.saveTickets(updatedList);
    this.selectedTicket.set(updated);
    return of(updated);
  }

  private escalateTicketLocal(id: number, req: EscalateTicketRequest): Observable<Ticket> {
    const list = this.tickets();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return throwError(() => new Error('Ticket no encontrado'));

    const currentTicket = list[index];
    const updated: Ticket = {
      ...currentTicket,
      estado: 'EN_DESARROLLO',
      asignadoAId: req.asignadoAId,
      asignadoANombre: 'Aldair (Tech Lead)',
      version: currentTicket.version + 1,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [...list];
    updatedList[index] = updated;
    this.saveTickets(updatedList);
    this.selectedTicket.set(updated);
    return of(updated);
  }

  private addCommentLocal(id: number, comentario: string, esPrivadoTi: boolean): Observable<Ticket> {
    const list = this.tickets();
    const ticket = list.find((t) => t.id === id);
    if (!ticket) return throwError(() => new Error('Ticket no encontrado'));

    const user = this.authService.currentUser();
    const newComment: TicketComment = {
      id: Date.now(),
      usuarioId: user?.id || 1,
      usuarioNombre: user ? `${user.nombre} ${user.apellido}` : 'Usuario Interno',
      comentario,
      esPrivadoTi,
      createdAt: new Date().toISOString(),
    };

    const updated = { ...ticket, comentarios: [...ticket.comentarios, newComment] };
    const updatedList = list.map((t) => (t.id === id ? updated : t));
    this.saveTickets(updatedList);
    this.selectedTicket.set(updated);
    return of(updated);
  }

  private uploadAttachmentLocal(ticketId: number, file: File): Ticket {
    const list = this.tickets();
    const ticket = list.find((t) => t.id === ticketId);
    if (!ticket) return list[0];

    const newAtt: TicketAttachment = {
      id: Date.now(),
      nombreArchivo: file.name,
      urlS3: `https://opshub-deploy-idat-2026.s3.us-east-2.amazonaws.com/evidence/${ticketId}_${file.name}`,
      mimeType: file.type || 'application/octet-stream',
      tamanioBytes: file.size,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...ticket,
      adjuntos: [...(ticket.adjuntos || []), newAtt],
    };
    this.saveTickets(list.map((t) => (t.id === ticketId ? updated : t)));
    this.selectedTicket.set(updated);
    return updated;
  }

  private getStoredTickets(): Ticket[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  }

  private saveTickets(tickets: Ticket[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {}
    this.tickets.set(tickets);
  }
}
