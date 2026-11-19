import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { TicketService } from '../../../core/services/ticket.service';
import { ClientNoteType, ClientSaas } from '../../../core/models/client.model';
import { PriorityBadgeComponent } from '../../../shared/components/badge/priority-badge.component';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import {
  LucideArrowLeft,
  LucideMapPin,
  LucideTicket,
  LucidePlus,
  LucideMessageSquare,
  LucideSend,
  LucideUserCheck,
  LucideClock,
} from '@lucide/angular';

@Component({
  selector: 'app-client-360',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    PriorityBadgeComponent,
    StatusBadgeComponent,
    ButtonComponent,
    CardComponent,
    LucideArrowLeft,
    LucideMapPin,
    LucideTicket,
    LucidePlus,
    LucideMessageSquare,
    LucideSend,
    LucideUserCheck,
    LucideClock,
  ],
  template: `
    @if (client(); as c) {
      <div class="space-y-6 max-w-6xl mx-auto">
        <!-- TOP NAVIGATION & HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-surface-border">
          <div class="flex items-center gap-3">
            <a
              routerLink="/clients"
              class="p-2 rounded-lg bg-surface-card border border-surface-border text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
            >
              <svg lucideArrowLeft class="w-4 h-4"></svg>
            </a>
            <div>
              <div class="flex items-center flex-wrap gap-2">
                <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {{ c.razonSocial }}
                </h1>
                <span class="font-mono text-xs px-2 py-0.5 rounded bg-surface-card border border-surface-border text-opsText-muted">
                  RUC: {{ c.ruc }}
                </span>
                <span
                  class="font-mono text-xs font-bold px-2 py-0.5 rounded border"
                  [ngClass]="[
                    c.planCodigo === 'ENTERPRISE'
                      ? 'bg-primary-light text-primary border-primary-border'
                      : 'bg-secondary-light text-secondary border-secondary-border'
                  ]"
                >
                  {{ c.planCodigo }}
                </span>
              </div>
              <div class="text-xs text-opsText-muted mt-1 flex items-center gap-2">
                <span class="flex items-center gap-1">
                  <svg lucideMapPin class="w-3.5 h-3.5"></svg>
                  <span>{{ c.direccionFiscal }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- CHURN RISK PILL & HEALTH SCORE -->
          <div class="flex items-center gap-3">
            <!-- Churn Risk Indicator -->
            @if (c.churnRisk === 'ALTO') {
              <div class="px-3 py-1.5 rounded-lg bg-p1-light border border-p1-border flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-p1 animate-ping"></span>
                <div class="text-left">
                  <div class="text-[9px] font-mono uppercase text-p1 font-bold">Semáforo Churn</div>
                  <div class="text-xs font-bold text-p1">ALTO RIESGO</div>
                </div>
              </div>
            } @else if (c.churnRisk === 'MEDIO') {
              <div class="px-3 py-1.5 rounded-lg bg-p2-light border border-p2-border flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-p2"></span>
                <div class="text-left">
                  <div class="text-[9px] font-mono uppercase text-p2 font-bold">Semáforo Churn</div>
                  <div class="text-xs font-bold text-p2">RIESGO MEDIO</div>
                </div>
              </div>
            } @else {
              <div class="px-3 py-1.5 rounded-lg bg-success-light border border-success-border flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-success"></span>
                <div class="text-left">
                  <div class="text-[9px] font-mono uppercase text-success font-bold">Semáforo Churn</div>
                  <div class="text-xs font-bold text-success">BAJO RIESGO</div>
                </div>
              </div>
            }

            <!-- Health Score -->
            <div class="px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-center">
              <div class="text-[9px] font-mono uppercase text-opsText-muted">Salud Cuenta</div>
              <div class="text-sm font-mono font-bold text-white">{{ c.healthScore }}%</div>
            </div>
          </div>
        </div>

        <!-- COMMERCIAL 360 METRICS BAR -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-surface-card border border-surface-border">
            <div class="text-[10px] font-mono uppercase text-opsText-muted">Facturación Anual (ARR)</div>
            <div class="text-lg font-bold font-mono text-white mt-1">\${{ c.montoAnualContratado | number }} USD</div>
          </div>

          <div class="p-4 rounded-xl bg-surface-card border border-surface-border">
            <div class="text-[10px] font-mono uppercase text-opsText-muted">Satisfacción CSAT</div>
            <div class="text-lg font-bold text-yellow-400 mt-1 flex items-center gap-1">
              <span>{{ c.csatAverage }}</span>
              <span class="text-xs text-opsText-muted font-normal">/ 5.0 ⭐</span>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-surface-card border border-surface-border">
            <div class="text-[10px] font-mono uppercase text-opsText-muted">Incidentes Históricos</div>
            <div class="text-lg font-bold font-mono text-accentCyan mt-1">{{ clientTickets().length }} tickets</div>
          </div>

          <div class="p-4 rounded-xl bg-surface-card border border-surface-border">
            <div class="text-[10px] font-mono uppercase text-opsText-muted">Estado de Cuenta</div>
            <div class="text-lg font-bold font-mono text-success mt-1">{{ c.estadoCuenta }}</div>
          </div>
        </div>

        <!-- 2-COLUMN DETAILED VIEW -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- LEFT 2 COLS: TICKETS HISTORY & NOTES -->
          <div class="lg:col-span-2 space-y-6">
            <!-- TICKETS HISTORY CARD -->
            <app-card [padding]="true">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <svg lucideTicket class="w-4 h-4 text-primary"></svg>
                  <span class="text-xs font-bold uppercase tracking-wider text-opsText-muted">
                    Historial de Incidentes de Soporte ({{ clientTickets().length }})
                  </span>
                </div>
                <a
                  routerLink="/tickets/new"
                  class="text-xs font-semibold text-primary hover:text-primary-focus transition-colors flex items-center gap-1"
                >
                  <svg lucidePlus class="w-3.5 h-3.5"></svg>
                  <span>Reportar por esta cuenta</span>
                </a>
              </div>

              <div class="space-y-2.5">
                @for (ticket of clientTickets(); track ticket.id) {
                  <div
                    [routerLink]="['/tickets', ticket.id]"
                    class="p-3 rounded-lg bg-canvas border border-surface-border hover:border-slate-500 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-bold text-white group-hover:text-primary transition-colors">
                          #{{ ticket.codigo }}
                        </span>
                        <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-border text-opsText-muted">
                          v{{ ticket.version }}
                        </span>
                        <app-priority-badge [priority]="ticket.prioridad" size="sm"></app-priority-badge>
                        <app-status-badge [status]="ticket.estado" size="sm"></app-status-badge>
                      </div>

                      <div class="text-xs font-medium text-white truncate mt-1">
                        {{ ticket.titulo }}
                      </div>
                    </div>

                    <div class="text-right text-[11px] font-mono text-opsText-muted shrink-0">
                      {{ ticket.createdAt | date: 'shortDate' }}
                    </div>
                  </div>
                } @empty {
                  <p class="text-xs text-opsText-muted italic text-center py-4">
                    Esta cuenta no registra tickets técnicos recientes.
                  </p>
                }
              </div>
            </app-card>

            <!-- INTERDEPARTMENTAL COMMERCIAL NOTES (RU23 / RU27) -->
            <app-card [padding]="true">
              <div class="flex items-center gap-2 mb-4">
                <svg lucideMessageSquare class="w-4 h-4 text-secondary"></svg>
                <span class="text-xs font-bold uppercase tracking-wider text-opsText-muted">
                  Bitácora Comercial Interdepartamental (Ventas & Soporte)
                </span>
              </div>

              <!-- Notes Thread -->
              <div class="space-y-3 mb-5">
                @for (n of c.notas; track n.id) {
                  <div class="p-3.5 rounded-lg bg-canvas border border-surface-border space-y-1.5 text-xs">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-white">{{ n.usuarioNombre }}</span>
                        <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-border text-accentCyan">
                          {{ n.tipoNota }}
                        </span>
                      </div>
                      <span class="text-[10px] font-mono text-opsText-muted">
                        {{ n.createdAt | date: 'short' }}
                      </span>
                    </div>

                    <p class="text-opsText-secondary leading-relaxed whitespace-pre-line">
                      {{ n.nota }}
                    </p>
                  </div>
                } @empty {
                  <p class="text-xs text-opsText-muted italic text-center py-4">
                    Sin anotaciones comerciales registradas.
                  </p>
                }
              </div>

              <!-- Add Commercial Note Box -->
              <div class="pt-4 border-t border-surface-border space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-[11px] font-semibold text-opsText-muted uppercase">Tipo de Nota:</span>
                  <select
                    [(ngModel)]="newNoteType"
                    class="bg-canvas border border-surface-border rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="RENOVACION">Negociación de Renovación</option>
                    <option value="RIESGO_CHURN">Alerta de Riesgo Churn</option>
                    <option value="SOPORTE_CRITICO">Compromiso Técnico de Soporte</option>
                    <option value="GENERAL">Anotación General</option>
                  </select>
                </div>

                <textarea
                  [(ngModel)]="newNoteText"
                  rows="3"
                  placeholder="Escribe notas sobre acuerdos comerciales, riesgos planteados por el cliente o acuerdos previos a renovación..."
                  class="w-full bg-canvas border border-surface-border rounded-md p-3 text-xs text-white placeholder-opsText-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                ></textarea>

                <div class="flex justify-end">
                  <app-button
                    size="sm"
                    variant="primary"
                    [disabled]="!newNoteText.trim()"
                    [loading]="isAddingNote()"
                    (btnClick)="onAddNote()"
                  >
                    <svg lucideSend class="w-3.5 h-3.5"></svg>
                    <span>Guardar Nota en Ficha 360°</span>
                  </app-button>
                </div>
              </div>
            </app-card>
          </div>

          <!-- RIGHT 1 COL: AUTHORIZED CONTACTS (RU06) -->
          <div class="space-y-6">
            <app-card [padding]="true">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <svg lucideUserCheck class="w-4 h-4 text-accentCyan"></svg>
                  <span class="text-xs font-bold uppercase tracking-wider text-opsText-muted">
                    Contactos Autorizados (RU06)
                  </span>
                </div>

                <button
                  type="button"
                  (click)="openContactModal.set(true)"
                  class="text-xs font-semibold text-accentCyan hover:underline flex items-center gap-1"
                >
                  <svg lucidePlus class="w-3.5 h-3.5"></svg>
                  <span>Agregar</span>
                </button>
              </div>

              <div class="space-y-3">
                @for (ct of c.contactos; track ct.id) {
                  <div class="p-3 rounded-lg bg-canvas border border-surface-border space-y-1 text-xs">
                    <div class="flex items-center justify-between">
                      <div class="font-bold text-white">
                        {{ ct.nombre }}
                      </div>
                      @if (ct.esPrincipal) {
                        <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-accentCyan-light text-accentCyan border border-accentCyan-border">
                          PRINCIPAL
                        </span>
                      }
                    </div>

                    <div class="text-[11px] text-opsText-muted">
                      {{ ct.cargo }}
                    </div>

                    <div class="pt-1 flex items-center justify-between text-[11px] text-opsText-secondary font-mono">
                      <a [href]="'mailto:' + ct.email" class="hover:text-primary truncate">
                        {{ ct.email }}
                      </a>
                      <a [href]="'tel:' + ct.telefono" class="text-accentCyan hover:underline ml-2">
                        {{ ct.telefono }}
                      </a>
                    </div>
                  </div>
                }
              </div>
            </app-card>

            <!-- SLA POLICY DETAILS -->
            <app-card [padding]="true">
              <div class="text-xs font-bold uppercase tracking-wider text-opsText-muted mb-3 flex items-center gap-1.5">
                <svg lucideClock class="w-4 h-4 text-p2"></svg>
                <span>Póliza de Servicio (SLA)</span>
              </div>

              <div class="space-y-2.5 text-xs text-opsText-secondary">
                <div class="flex items-center justify-between p-2 rounded bg-canvas border border-surface-border">
                  <span class="text-opsText-muted">SLA Resolución P1:</span>
                  <span class="font-mono font-bold text-p1">Menor a 4 horas</span>
                </div>

                <div class="flex items-center justify-between p-2 rounded bg-canvas border border-surface-border">
                  <span class="text-opsText-muted">SLA Resolución P2-P4:</span>
                  <span class="font-mono font-bold text-white">Menor a 24 horas</span>
                </div>

                <div class="flex items-center justify-between p-2 rounded bg-canvas border border-surface-border">
                  <span class="text-opsText-muted">Canal Preferente:</span>
                  <span class="font-mono text-accentCyan font-bold">Línea Telefónica Directa</span>
                </div>
              </div>
            </app-card>
          </div>
        </div>

        <!-- MODAL: AGREGAR CONTACTO AUTORIZADO -->
        @if (openContactModal()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div class="w-full max-w-md rounded-xl bg-surface-card border border-surface-border p-6 space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-surface-border">
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <svg lucideUserCheck class="w-4 h-4 text-accentCyan"></svg>
                  <span>Registrar Contacto Autorizado</span>
                </h3>
                <button
                  (click)="openContactModal.set(false)"
                  class="text-opsText-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div class="space-y-3 text-xs">
                <div>
                  <label class="block text-opsText-muted font-semibold uppercase mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    [(ngModel)]="newContactName"
                    placeholder="Ej: Ing. Marco Díaz"
                    class="w-full bg-canvas border border-surface-border rounded-md px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label class="block text-opsText-muted font-semibold uppercase mb-1">Cargo *</label>
                  <input
                    type="text"
                    [(ngModel)]="newContactRole"
                    placeholder="Ej: Coordinador TI / Contabilidad"
                    class="w-full bg-canvas border border-surface-border rounded-md px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label class="block text-opsText-muted font-semibold uppercase mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    [(ngModel)]="newContactEmail"
                    placeholder="mdiaz@empresa.com.pe"
                    class="w-full bg-canvas border border-surface-border rounded-md px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label class="block text-opsText-muted font-semibold uppercase mb-1">Teléfono Directo *</label>
                  <input
                    type="tel"
                    [(ngModel)]="newContactPhone"
                    placeholder="+51 988 123 456"
                    class="w-full bg-canvas border border-surface-border rounded-md px-3 py-2 text-white"
                  />
                </div>

                <label class="flex items-center gap-2 text-opsText-secondary cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    [(ngModel)]="newContactIsPrincipal"
                    class="rounded bg-canvas border-surface-border text-accentCyan focus:ring-accentCyan h-3.5 w-3.5"
                  />
                  <span>Marcar como Contacto Principal</span>
                </label>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
                <app-button
                  size="sm"
                  variant="secondary"
                  (btnClick)="openContactModal.set(false)"
                >
                  Cancelar
                </app-button>

                <app-button
                  size="sm"
                  variant="primary"
                  [disabled]="!newContactName.trim() || !newContactEmail.trim()"
                  (btnClick)="onConfirmAddContact()"
                >
                  Guardar Contacto
                </app-button>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="py-16 text-center text-opsText-muted">
        <svg lucideClock class="w-8 h-8 mx-auto animate-spin mb-2"></svg>
        <p>Cargando ficha comercial 360°...</p>
      </div>
    }
  `,
})
export class Client360Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private ticketService = inject(TicketService);

  client = signal<ClientSaas | null>(null);

  // Tickets de este cliente particular
  clientTickets = computed(() => {
    const c = this.client();
    if (!c) return [];
    return this.ticketService.tickets().filter((t) => t.clienteId === c.id);
  });

  // State for new note
  newNoteText: string = '';
  newNoteType: ClientNoteType = 'RENOVACION';
  isAddingNote = signal<boolean>(false);

  // State for new contact modal
  openContactModal = signal<boolean>(false);
  newContactName: string = '';
  newContactRole: string = '';
  newContactEmail: string = '';
  newContactPhone: string = '+51 9';
  newContactIsPrincipal: boolean = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.loadClient(id);
    }
  }

  loadClient(id: number): void {
    this.clientService.getClientById(id).subscribe({
      next: (c) => {
        this.client.set(c);
      },
      error: () => {
        this.router.navigate(['/clients']);
      },
    });
  }

  onAddNote(): void {
    const c = this.client();
    if (!c || !this.newNoteText.trim()) return;

    this.isAddingNote.set(true);

    this.clientService.addNote(c.id, this.newNoteText.trim(), this.newNoteType).subscribe({
      next: (updated) => {
        this.client.set(updated);
        this.newNoteText = '';
        this.isAddingNote.set(false);
      },
      error: () => {
        this.isAddingNote.set(false);
      },
    });
  }

  onConfirmAddContact(): void {
    const c = this.client();
    if (!c || !this.newContactName.trim() || !this.newContactEmail.trim()) return;

    this.clientService
      .addContact(c.id, {
        nombre: this.newContactName.trim(),
        cargo: this.newContactRole.trim(),
        email: this.newContactEmail.trim(),
        telefono: this.newContactPhone.trim(),
        esPrincipal: this.newContactIsPrincipal,
      })
      .subscribe({
        next: (updated) => {
          this.client.set(updated);
          this.openContactModal.set(false);
          this.newContactName = '';
          this.newContactRole = '';
          this.newContactEmail = '';
          this.newContactPhone = '+51 9';
          this.newContactIsPrincipal = false;
        },
      });
  }
}
