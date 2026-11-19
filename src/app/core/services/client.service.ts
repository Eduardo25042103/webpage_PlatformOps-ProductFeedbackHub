import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import {
  ClientContact,
  ClientNote,
  ClientNoteType,
  ClientSaas,
} from '../models/client.model';
import { INITIAL_CLIENTS } from './demo-clients.data';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const CLIENTS_STORAGE_KEY = 'opshub_clients_data';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Signals reactivas de estado
  readonly clients = signal<ClientSaas[]>(this.getStoredClients());
  readonly selectedClient = signal<ClientSaas | null>(null);

  // Filtros reactivos
  readonly filterPlan = signal<string>('ALL');
  readonly filterRisk = signal<string>('ALL');
  readonly searchTerm = signal<string>('');

  // Clientes filtrados
  readonly filteredClients = computed(() => {
    let list = this.clients();

    const plan = this.filterPlan();
    if (plan !== 'ALL') {
      list = list.filter((c) => c.planCodigo === plan);
    }

    const risk = this.filterRisk();
    if (risk !== 'ALL') {
      list = list.filter((c) => c.churnRisk === risk);
    }

    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(
        (c) =>
          c.razonSocial.toLowerCase().includes(term) ||
          c.ruc.includes(term) ||
          (c.nombreComercial && c.nombreComercial.toLowerCase().includes(term))
      );
    }

    return list;
  });

  // Métricas de portafolio comercial
  readonly summaryMetrics = computed(() => {
    const list = this.clients();
    const totalArr = list.reduce((acc, c) => acc + c.montoAnualContratado, 0);
    const highRiskCount = list.filter((c) => c.churnRisk === 'ALTO').length;
    const totalContacts = list.reduce((acc, c) => acc + c.contactos.length, 0);

    return {
      totalAccounts: list.length,
      totalArr,
      highRiskCount,
      totalContacts,
    };
  });

  constructor() {
    if (this.clients().length === 0) {
      this.saveClients(INITIAL_CLIENTS);
    }
  }

  /**
   * Obtiene la lista de clientes SaaS desde el backend (GET /api/v1/clients)
   */
  getClients(): Observable<ClientSaas[]> {
    const url = `${environment.apiUrl}/clients`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const rawList = res?.data || (Array.isArray(res) ? res : null);
        if (rawList && Array.isArray(rawList) && rawList.length > 0) {
          const mapped: ClientSaas[] = rawList.map((c: any) => ({
            id: c.id,
            ruc: c.ruc,
            razonSocial: c.razonSocial,
            nombreComercial: c.nombreComercial,
            planId: c.planId,
            planCodigo: c.planCodigo,
            planNombre: c.planNombre,
            montoAnualContratado: c.montoAnualContratado,
            estadoCuenta: c.estadoCuenta,
            fechaRegistro: c.fechaRegistro,
            direccionFiscal: c.direccionFiscal,
            totalTickets: c.totalTickets,
            csatAverage: c.csatAverage,
            churnRisk: c.churnRisk,
            healthScore: c.healthScore,
            contactos: c.contactos || [],
            notas: c.notas || [],
          }));
          this.saveClients(mapped);
          return mapped;
        }
        return this.clients();
      }),
      catchError(() => {
        return of(this.clients());
      })
    );
  }

  /**
   * Obtiene la ficha 360° de un cliente desde el backend (GET /api/v1/clients/{id})
   */
  getClientById(id: number): Observable<ClientSaas> {
    const url = `${environment.apiUrl}/clients/${id}`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const item = res?.data || res;
        if (item && item.id) {
          const client: ClientSaas = {
            id: item.id,
            ruc: item.ruc,
            razonSocial: item.razonSocial,
            nombreComercial: item.nombreComercial,
            planId: item.planId,
            planCodigo: item.planCodigo,
            planNombre: item.planNombre,
            montoAnualContratado: item.montoAnualContratado,
            estadoCuenta: item.estadoCuenta,
            fechaRegistro: item.fechaRegistro,
            direccionFiscal: item.direccionFiscal,
            totalTickets: item.totalTickets,
            csatAverage: item.csatAverage,
            churnRisk: item.churnRisk,
            healthScore: item.healthScore,
            contactos: item.contactos || [],
            notas: item.notas || [],
          };
          this.selectedClient.set(client);
          this.clients.update((list) => list.map((c) => (c.id === client.id ? client : c)));
          return client;
        }
        return this.getClientLocal(id);
      }),
      catchError(() => {
        return of(this.getClientLocal(id));
      })
    );
  }

  /**
   * Agrega una nota comercial interdepartamental (POST /api/v1/clients/{id}/notes)
   */
  addNote(clientId: number, nota: string, tipoNota: ClientNoteType): Observable<ClientSaas> {
    const url = `${environment.apiUrl}/clients/${clientId}/notes`;

    const payload = {
      tipoNota,
      nota,
    };

    return this.http.post<any>(url, payload).pipe(
      map((res) => {
        const noteData = res?.data;
        const list = this.clients();
        const client = list.find((c) => c.id === clientId);
        if (client) {
          const user = this.authService.currentUser();
          const newNote: ClientNote = {
            id: noteData?.id || Date.now(),
            clienteId: clientId,
            usuarioId: user?.id || 1,
            usuarioNombre: user ? `${user.nombre} ${user.apellido}` : 'Usuario Interno',
            usuarioRol: user?.rolCodigo || 'EJECUTIVO_VENTAS',
            tipoNota,
            nota,
            createdAt: noteData?.createdAt || new Date().toISOString(),
          };
          const updated: ClientSaas = {
            ...client,
            notas: [newNote, ...client.notas],
          };
          const updatedList = list.map((c) => (c.id === clientId ? updated : c));
          this.saveClients(updatedList);
          this.selectedClient.set(updated);
          return updated;
        }
        return this.getClientLocal(clientId);
      }),
      catchError(() => {
        return of(this.addNoteLocal(clientId, nota, tipoNota));
      })
    );
  }

  /**
   * Agrega un contacto autorizado (POST /api/v1/clients/{id}/contacts)
   */
  addContact(clientId: number, contact: Omit<ClientContact, 'id' | 'clienteId'>): Observable<ClientSaas> {
    const url = `${environment.apiUrl}/clients/${clientId}/contacts`;

    const payload = {
      nombre: contact.nombre,
      cargo: contact.cargo,
      email: contact.email,
      telefono: contact.telefono,
      esPrincipal: contact.esPrincipal,
    };

    return this.http.post<any>(url, payload).pipe(
      map((res) => {
        const contactData = res?.data;
        const list = this.clients();
        const client = list.find((c) => c.id === clientId);
        if (client) {
          const newContact: ClientContact = {
            id: contactData?.id || Date.now(),
            clienteId: clientId,
            ...contact,
          };
          const updated: ClientSaas = {
            ...client,
            contactos: [...client.contactos, newContact],
          };
          const updatedList = list.map((c) => (c.id === clientId ? updated : c));
          this.saveClients(updatedList);
          this.selectedClient.set(updated);
          return updated;
        }
        return this.getClientLocal(clientId);
      }),
      catchError(() => {
        return of(this.addContactLocal(clientId, contact));
      })
    );
  }

  refreshClients(): void {
    this.getClients().subscribe();
  }

  // --- Contingencia local ---
  private getClientLocal(id: number): ClientSaas {
    const found = this.clients().find((c) => c.id === id);
    if (!found) {
      throw new Error(`Cliente con ID ${id} no encontrado`);
    }
    this.selectedClient.set(found);
    return found;
  }

  private addNoteLocal(clientId: number, nota: string, tipoNota: ClientNoteType): ClientSaas {
    const list = this.clients();
    const index = list.findIndex((c) => c.id === clientId);
    if (index === -1) throw new Error('Cliente no encontrado');

    const user = this.authService.currentUser();
    const client = list[index];

    const newNote: ClientNote = {
      id: Date.now(),
      clienteId: clientId,
      usuarioId: user?.id || 1,
      usuarioNombre: user ? `${user.nombre} ${user.apellido}` : 'Usuario Interno',
      usuarioRol: user?.rolCodigo || 'EJECUTIVO_VENTAS',
      tipoNota,
      nota,
      createdAt: new Date().toISOString(),
    };

    const updated = { ...client, notas: [newNote, ...client.notas] };
    const updatedList = [...list];
    updatedList[index] = updated;
    this.saveClients(updatedList);
    this.selectedClient.set(updated);
    return updated;
  }

  private addContactLocal(clientId: number, contact: Omit<ClientContact, 'id' | 'clienteId'>): ClientSaas {
    const list = this.clients();
    const index = list.findIndex((c) => c.id === clientId);
    if (index === -1) throw new Error('Cliente no encontrado');

    const client = list[index];
    const newContact: ClientContact = {
      id: Date.now(),
      clienteId: clientId,
      ...contact,
    };

    const updated = { ...client, contactos: [...client.contactos, newContact] };
    const updatedList = [...list];
    updatedList[index] = updated;
    this.saveClients(updatedList);
    this.selectedClient.set(updated);
    return updated;
  }

  private getStoredClients(): ClientSaas[] {
    try {
      const data = localStorage.getItem(CLIENTS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  }

  private saveClients(clients: ClientSaas[]): void {
    try {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    } catch {}
    this.clients.set(clients);
  }
}
