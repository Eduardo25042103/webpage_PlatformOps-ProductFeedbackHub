import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket, TicketStatus } from '../../../core/models/ticket.model';
import { PriorityBadgeComponent } from '../../../shared/components/badge/priority-badge.component';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ConflictDialogComponent } from '../../../shared/components/conflict-dialog/conflict-dialog.component';
import {
  LucideArrowLeft,
  LucideBuilding2,
  LucidePhone,
  LucideUser,
  LucidePaperclip,
  LucideMessageSquare,
  LucideLock,
  LucideSend,
  LucideZap,
  LucideTrash2,
  LucideClock,
  LucideShare2,
  LucideExternalLink,
  LucideUploadCloud,
  LucideShieldCheck,
} from '@lucide/angular';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    PriorityBadgeComponent,
    StatusBadgeComponent,
    ButtonComponent,
    CardComponent,
    ConflictDialogComponent,
    LucideArrowLeft,
    LucideBuilding2,
    LucidePhone,
    LucideUser,
    LucidePaperclip,
    LucideMessageSquare,
    LucideLock,
    LucideSend,
    LucideZap,
    LucideTrash2,
    LucideClock,
    LucideShare2,
    LucideExternalLink,
    LucideUploadCloud,
    LucideShieldCheck,
  ],
  template: `
    @if (ticket(); as t) {
      <div class="space-y-6 max-w-6xl mx-auto">
        <!-- TOP TOOLBAR & BREADCRUMB -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-surface-border">
          <div class="flex items-center gap-3">
            <a
              routerLink="/tickets"
              class="p-2 rounded-lg bg-surface-card border border-surface-border text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
            >
              <svg lucideArrowLeft class="w-4 h-4"></svg>
            </a>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-lg font-bold text-white tracking-wider">
                  #{{ t.codigo }}
                </span>
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-card border border-surface-border text-accentCyan">
                  v{{ t.version }}
                </span>
                <app-priority-badge [priority]="t.prioridad" size="sm"></app-priority-badge>
                <app-status-badge [status]="t.estado" size="sm"></app-status-badge>
              </div>
              <div class="text-xs text-opsText-muted mt-0.5 flex items-center gap-2">
                <span>Canal: <strong class="text-opsText-secondary font-mono">{{ t.canalOrigen }}</strong></span>
                <span>&bull;</span>
                <span>Registrado hace poco</span>
              </div>
            </div>
          </div>

          <!-- ACTION BUTTONS: SIMULATE 409 & ESCALATE -->
          <div class="flex items-center flex-wrap gap-2.5">
            <!-- BOTÓN DE PRUEBA: Simular Conflicto 409 -->
            <button
              type="button"
              (click)="onSimulateConflict()"
              title="Altera la versión en el servidor para forzar un error HTTP 409 en tu próxima edición"
              class="px-2.5 py-1.5 rounded-md text-xs font-mono font-bold bg-p1-light text-p1 border border-p1-border hover:bg-p1 hover:text-white transition-all flex items-center gap-1.5"
            >
              <svg lucideZap class="w-3.5 h-3.5"></svg>
              <span>Simular Conflicto (409)</span>
            </button>

            <!-- Botón Escalar a Desarrollo -->
            <app-button
              variant="outline"
              size="sm"
              (btnClick)="openEscalateModal.set(true)"
            >
              <svg lucideShare2 class="w-3.5 h-3.5"></svg>
              <span>Escalar a TI</span>
            </app-button>

            <!-- Botón Eliminar -->
            <button
              type="button"
              (click)="onDeleteTicket()"
              class="p-2 text-opsText-muted hover:text-p1 rounded-md hover:bg-p1-light transition-colors"
              title="Eliminar ticket"
            >
              <svg lucideTrash2 class="w-4 h-4"></svg>
            </button>
          </div>
        </div>

        <!-- MAIN 2-COLUMN GRID -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- LEFT COLUMN: CONTENT, ATTACHMENTS & COMMENTS (2 COLS) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- TITLE & DESCRIPTION CARD -->
            <app-card [padding]="true">
              <h2 class="text-lg font-bold text-white leading-snug">
                {{ t.titulo }}
              </h2>
              <p class="text-sm text-opsText-secondary mt-3 whitespace-pre-line leading-relaxed">
                {{ t.descripcion }}
              </p>
            </app-card>

            <!-- S3 ATTACHMENTS SECTION -->
            <app-card [padding]="true">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <svg lucidePaperclip class="w-4 h-4 text-accentCyan"></svg>
                  <span class="text-xs font-bold uppercase tracking-wider text-opsText-muted">
                    Adjuntos y Trazas en Amazon S3 ({{ t.adjuntos.length }})
                  </span>
                </div>

                <label class="cursor-pointer text-xs font-semibold text-primary hover:text-primary-focus flex items-center gap-1 transition-colors">
                  <svg lucideUploadCloud class="w-3.5 h-3.5"></svg>
                  <span>+ Subir a S3</span>
                  <input
                    type="file"
                    (change)="onUploadFile($event)"
                    class="hidden"
                  />
                </label>
              </div>

              @if (t.adjuntos.length > 0) {
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (att of t.adjuntos; track att.id) {
                    <div class="p-3 rounded-lg bg-canvas border border-surface-border flex items-center justify-between gap-2 hover:border-slate-500 transition-colors">
                      <div class="flex items-center gap-2 min-w-0">
                        <svg lucidePaperclip class="w-4 h-4 text-opsText-muted shrink-0"></svg>
                        <div class="truncate">
                          <div class="text-xs font-mono font-medium text-white truncate">
                            {{ att.nombreArchivo }}
                          </div>
                          <div class="text-[10px] text-opsText-muted font-mono">
                            {{ (att.tamanioBytes / 1024).toFixed(1) }} KB &bull; S3 Bucket Privado
                          </div>
                        </div>
                      </div>

                      <a
                        [href]="att.urlS3"
                        target="_blank"
                        class="p-1 text-opsText-muted hover:text-primary transition-colors shrink-0"
                        title="Ver evidencia"
                      >
                        <svg lucideExternalLink class="w-3.5 h-3.5"></svg>
                      </a>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-xs text-opsText-muted py-4 text-center border border-dashed border-surface-border rounded-lg">
                  Sin archivos adjuntos. Usa el botón "+ Subir a S3" para anexar capturas o logs.
                </div>
              }
            </app-card>

            <!-- ESCALATION HISTORY -->
            @if (t.escalaciones.length > 0) {
              <app-card [padding]="true">
                <div class="flex items-center gap-2 mb-3 text-secondary">
                  <svg lucideShare2 class="w-4 h-4"></svg>
                  <span class="text-xs font-bold uppercase tracking-wider">
                    Historial de Escalaciones a Desarrollo
                  </span>
                </div>

                <div class="space-y-3">
                  @for (esc of t.escalaciones; track esc.id) {
                    <div class="p-3.5 rounded-lg bg-canvas border border-surface-border space-y-1.5 text-xs">
                      <div class="flex items-center justify-between text-opsText-muted">
                        <span class="font-semibold text-white">
                          {{ esc.escaladoPorNombre }} ➔ {{ esc.asignadoANombre }}
                        </span>
                        <span class="font-mono text-[10px]">{{ esc.createdAt | date: 'short' }}</span>
                      </div>
                      <p class="text-opsText-secondary">
                        <strong class="text-white">Motivo:</strong> {{ esc.motivoEscalacion }}
                      </p>
                      @if (esc.diagnosticoInicial) {
                        <p class="text-opsText-muted text-[11px]">
                          <strong>Diagnóstico L1:</strong> {{ esc.diagnosticoInicial }}
                        </p>
                      }
                    </div>
                  }
                </div>
              </app-card>
            }

            <!-- COMMENTS & TIMELINE -->
            <app-card [padding]="true">
              <div class="flex items-center gap-2 mb-4">
                <svg lucideMessageSquare class="w-4 h-4 text-primary"></svg>
                <span class="text-xs font-bold uppercase tracking-wider text-opsText-muted">
                  Hilo de Discusión Técnica ({{ t.comentarios.length }})
                </span>
              </div>

              <!-- List of Comments -->
              <div class="space-y-3 mb-5">
                @for (c of t.comentarios; track c.id) {
                  <div
                    class="p-3.5 rounded-lg border text-xs space-y-1.5"
                    [ngClass]="[
                      c.esPrivadoTi
                        ? 'bg-secondary/10 border-secondary/30'
                        : 'bg-canvas border-surface-border'
                    ]"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-white">{{ c.usuarioNombre }}</span>
                        @if (c.esPrivadoTi) {
                          <span class="inline-flex items-center gap-1 font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-secondary/20 text-secondary border border-secondary/30">
                            <svg lucideLock class="w-2.5 h-2.5"></svg>
                            Privado TI
                          </span>
                        }
                      </div>
                      <span class="text-[10px] font-mono text-opsText-muted">
                        {{ c.createdAt | date: 'short' }}
                      </span>
                    </div>

                    <p class="text-opsText-secondary leading-relaxed whitespace-pre-line">
                      {{ c.comentario }}
                    </p>
                  </div>
                } @empty {
                  <p class="text-xs text-opsText-muted italic text-center py-4">
                    No hay comentarios técnicos aún en este ticket.
                  </p>
                }
              </div>

              <!-- Add Comment Input Box -->
              <div class="pt-4 border-t border-surface-border space-y-3">
                <textarea
                  [(ngModel)]="newCommentText"
                  rows="3"
                  placeholder="Escribe una actualización técnica, notas de diagnóstico o pasos de resolución..."
                  class="w-full bg-canvas border border-surface-border rounded-md p-3 text-xs text-white placeholder-opsText-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                ></textarea>

                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 text-xs text-opsText-secondary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      [(ngModel)]="isCommentPrivateTi"
                      class="rounded bg-canvas border-surface-border text-secondary focus:ring-secondary h-3.5 w-3.5"
                    />
                    <span class="flex items-center gap-1">
                      <svg lucideLock class="w-3 h-3 text-secondary"></svg>
                      <span>Nota privada para TI / Desarrollo</span>
                    </span>
                  </label>

                  <app-button
                    size="sm"
                    variant="primary"
                    [disabled]="!newCommentText.trim()"
                    [loading]="isAddingComment()"
                    (btnClick)="onAddComment()"
                  >
                    <svg lucideSend class="w-3.5 h-3.5"></svg>
                    <span>Enviar Nota</span>
                  </app-button>
                </div>
              </div>
            </app-card>
          </div>

          <!-- RIGHT COLUMN: METADATA & OPTIMISTIC CONCURRENCY CONTROL (1 COL) -->
          <div class="space-y-6">
            <!-- OPTIMISTIC LOCKING: STATUS MUTATION CARD -->
            <app-card [padding]="true" class="border-primary/40 bg-surface-card">
              <div class="flex items-center justify-between mb-3 pb-2 border-b border-surface-border">
                <span class="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <svg lucideShieldCheck class="w-4 h-4 text-primary"></svg>
                  <span>Bloqueo Optimista</span>
                </span>
                <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-canvas border border-surface-border text-accentCyan">
                  v{{ t.version }}
                </span>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-[11px] font-semibold text-opsText-muted uppercase tracking-wider mb-1.5">
                    Modificar Estado
                  </label>
                  <select
                    [(ngModel)]="selectedStatus"
                    class="w-full bg-canvas border border-surface-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="NUEVO">NUEVO</option>
                    <option value="EN_DIAGNOSTICO">EN DIAGNÓSTICO</option>
                    <option value="EN_DESARROLLO">EN DESARROLLO</option>
                    <option value="EN_QA">EN QA</option>
                    <option value="RESUELTO">RESUELTO</option>
                    <option value="CERRADO">CERRADO</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-opsText-muted uppercase tracking-wider mb-1.5">
                    Nota del Cambio (Opcional)
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="statusComment"
                    placeholder="Ej: Código desplegado en Staging..."
                    class="w-full bg-canvas border border-surface-border rounded-md px-3 py-1.5 text-xs text-white placeholder-opsText-muted focus:outline-none focus:border-primary"
                  />
                </div>

                <app-button
                  [fullWidth]="true"
                  variant="primary"
                  size="sm"
                  [loading]="isUpdatingStatus()"
                  (btnClick)="onSaveStatus()"
                >
                  <span>Guardar Estado (Token v{{ t.version }})</span>
                </app-button>
              </div>
            </app-card>

            <!-- CLIENT SAAS CARD -->
            <app-card [padding]="true">
              <div class="text-xs font-bold uppercase tracking-wider text-opsText-muted mb-3 flex items-center gap-1.5">
                <svg lucideBuilding2 class="w-4 h-4 text-p2"></svg>
                <span>Empresa Cliente SaaS</span>
              </div>

              <div class="space-y-3 text-xs">
                <div>
                  <div class="font-bold text-white text-sm">
                    {{ t.clienteNombre }}
                  </div>
                  <div class="font-mono text-opsText-muted text-[11px]">
                    RUC: {{ t.clienteRuc }}
                  </div>
                </div>

                <div class="flex items-center justify-between p-2 rounded bg-canvas border border-surface-border">
                  <span class="text-opsText-muted">Plan Contratado:</span>
                  <span class="font-mono font-bold text-primary">{{ t.clientePlan }}</span>
                </div>

                <div class="p-2.5 rounded bg-canvas border border-surface-border flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg lucidePhone class="w-4 h-4 text-accentCyan"></svg>
                    <div>
                      <div class="text-[10px] text-opsText-muted uppercase">Teléfono Directo</div>
                      <div class="font-mono text-white font-semibold">{{ t.telefonoContacto }}</div>
                    </div>
                  </div>

                  <a
                    [href]="'tel:' + t.telefonoContacto"
                    class="text-[11px] font-semibold text-accentCyan hover:underline"
                  >
                    Llamar
                  </a>
                </div>
              </div>
            </app-card>

            <!-- ASSIGNMENT & DATES -->
            <app-card [padding]="true">
              <div class="text-xs font-bold uppercase tracking-wider text-opsText-muted mb-3 flex items-center gap-1.5">
                <svg lucideUser class="w-4 h-4 text-secondary"></svg>
                <span>Responsables & SLA</span>
              </div>

              <div class="space-y-3 text-xs text-opsText-secondary">
                <div class="flex items-center justify-between">
                  <span class="text-opsText-muted">Reportado por:</span>
                  <span class="text-white font-medium">{{ t.reportadoPorNombre }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-opsText-muted">Asignado a:</span>
                  <span class="text-secondary font-medium">
                    {{ t.asignadoANombre || 'Sin asignar' }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-opsText-muted">Categoría:</span>
                  <span class="text-white font-mono">{{ t.categoriaNombre }}</span>
                </div>

                <div class="pt-2 border-t border-surface-border flex items-center justify-between text-[11px]">
                  <span class="text-opsText-muted">Fecha Creación:</span>
                  <span class="font-mono">{{ t.createdAt | date: 'short' }}</span>
                </div>
              </div>
            </app-card>
          </div>
        </div>

        <!-- MODAL: ESCALAR A TI / DESARROLLO -->
        @if (openEscalateModal()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div class="w-full max-w-md rounded-xl bg-surface-card border border-surface-border p-6 space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-surface-border">
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <svg lucideShare2 class="w-4 h-4 text-secondary"></svg>
                  <span>Escalar Ticket a TI / Desarrollo</span>
                </h3>
                <button
                  (click)="openEscalateModal.set(false)"
                  class="text-opsText-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div class="space-y-3 text-xs">
                <div>
                  <label class="block text-opsText-muted font-semibold uppercase mb-1">
                    Ingeniero Asignado
                  </label>
                  <select
                    [(ngModel)]="escalateDevId"
                    class="w-full bg-canvas border border-surface-border rounded-md px-3 py-2 text-white"
                  >
                    <option [value]="1">Aldair Cahuana (Lead Dev .NET & Cloud)</option>
                    <option [value]="3">Josue Morales (Fullstack Dev)</option>
                    <option [value]="4">Eduardo Sánchez (QA / Dev)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-opsText-muted font-semibold uppercase mb-1">
                    Motivo de Escalación *
                  </label>
                  <textarea
                    [(ngModel)]="escalateReason"
                    rows="3"
                    placeholder="Explica por qué Soporte L1 no puede resolver la falla y qué intervención se requiere..."
                    class="w-full bg-canvas border border-surface-border rounded-md p-2.5 text-white"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-opsText-muted font-semibold uppercase mb-1">
                    Diagnóstico Inicial
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="escalateDiagnosis"
                    placeholder="Ej: Se comprobó que el servicio responde 500 interno..."
                    class="w-full bg-canvas border border-surface-border rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
                <app-button
                  size="sm"
                  variant="secondary"
                  (btnClick)="openEscalateModal.set(false)"
                >
                  Cancelar
                </app-button>

                <app-button
                  size="sm"
                  variant="primary"
                  [disabled]="!escalateReason.trim()"
                  (btnClick)="onConfirmEscalate()"
                >
                  Confirmar Escalación
                </app-button>
              </div>
            </div>
          </div>
        }

        <!-- MODAL: CONFLICTO DE CONCURRENCIA OPTIMISTA (HTTP 409) -->
        <app-conflict-dialog
          [isOpen]="showConflictModal()"
          [clientVersion]="conflictClientVersion()"
          [serverVersion]="conflictServerVersion()"
          (reload)="onReloadAfterConflict()"
          (cancel)="showConflictModal.set(false)"
        ></app-conflict-dialog>
      </div>
    } @else {
      <div class="py-16 text-center text-opsText-muted">
        <svg lucideClock class="w-8 h-8 mx-auto animate-spin mb-2"></svg>
        <p>Cargando información del incidente...</p>
      </div>
    }
  `,
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);

  ticket = signal<Ticket | null>(null);

  // Status mutation state
  selectedStatus: TicketStatus = 'NUEVO';
  statusComment: string = '';
  isUpdatingStatus = signal<boolean>(false);

  // New comment state
  newCommentText: string = '';
  isCommentPrivateTi: boolean = false;
  isAddingComment = signal<boolean>(false);

  // Escalation state
  openEscalateModal = signal<boolean>(false);
  escalateDevId: number = 1;
  escalateReason: string = '';
  escalateDiagnosis: string = '';

  // Concurrency 409 Modal state
  showConflictModal = signal<boolean>(false);
  conflictClientVersion = signal<number>(1);
  conflictServerVersion = signal<number>(2);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.loadTicket(id);
    }
  }

  loadTicket(id: number): void {
    this.ticketService.getTicketById(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.selectedStatus = t.estado;
      },
      error: () => {
        this.router.navigate(['/tickets']);
      },
    });
  }

  onSaveStatus(): void {
    const t = this.ticket();
    if (!t) return;

    this.isUpdatingStatus.set(true);

    this.ticketService
      .updateTicketStatus(t.id, {
        nuevoEstado: this.selectedStatus,
        currentVersion: t.version,
        comentario: this.statusComment,
      })
      .subscribe({
        next: (updated) => {
          this.ticket.set(updated);
          this.statusComment = '';
          this.isUpdatingStatus.set(false);
        },
        error: (err) => {
          this.isUpdatingStatus.set(false);

          // Capturamos el error 409 (Conflicto de Concurrencia Optimista)
          if (err.status === 409 || err.message?.includes('409') || err.error?.serverVersion) {
            this.conflictClientVersion.set(t.version);
            this.conflictServerVersion.set(err.error?.serverVersion || t.version + 1);
            this.showConflictModal.set(true);
          } else {
            alert('Error al actualizar el ticket');
          }
        },
      });
  }

  onSimulateConflict(): void {
    const t = this.ticket();
    if (!t) return;

    const fakeServerVersion = this.ticketService.simulateExternalConflict(t.id);
    alert(
      `[SIMULACIÓN CONCURRENTE ACTIVADA]:\n\nEn la base de datos (Amazon RDS MySQL), la versión de este ticket ahora es v${fakeServerVersion}.\n\nTu pantalla aún conserva la versión local v${t.version}.\n\nAhora haz clic en "Guardar Estado" para verificar cómo la aplicación captura el error HTTP 409 Conflict y despliega el diálogo de resolución.`
    );
  }

  onReloadAfterConflict(): void {
    const t = this.ticket();
    if (t) {
      this.loadTicket(t.id);
      this.showConflictModal.set(false);
    }
  }

  onAddComment(): void {
    const t = this.ticket();
    if (!t || !this.newCommentText.trim()) return;

    this.isAddingComment.set(true);

    this.ticketService
      .addComment(t.id, this.newCommentText.trim(), this.isCommentPrivateTi)
      .subscribe({
        next: (updated) => {
          this.ticket.set(updated);
          this.newCommentText = '';
          this.isAddingComment.set(false);
        },
        error: () => {
          this.isAddingComment.set(false);
        },
      });
  }

  onUploadFile(event: Event): void {
    const t = this.ticket();
    const input = event.target as HTMLInputElement;
    if (t && input.files && input.files[0]) {
      this.ticketService.uploadAttachment(t.id, input.files[0]).subscribe({
        next: (updated: Ticket) => {
          this.ticket.set(updated);
        },
      });
    }
  }

  onConfirmEscalate(): void {
    const t = this.ticket();
    if (!t || !this.escalateReason.trim()) return;

    this.ticketService
      .escalateTicket(t.id, {
        asignadoAId: Number(this.escalateDevId),
        motivoEscalacion: this.escalateReason,
        diagnosticoInicial: this.escalateDiagnosis,
        currentVersion: t.version,
      })
      .subscribe({
        next: (updated) => {
          this.ticket.set(updated);
          this.openEscalateModal.set(false);
          this.escalateReason = '';
          this.escalateDiagnosis = '';
        },
        error: (err) => {
          if (err.status === 409) {
            this.conflictClientVersion.set(t.version);
            this.conflictServerVersion.set(err.error?.serverVersion || t.version + 1);
            this.showConflictModal.set(true);
          }
        },
      });
  }

  onDeleteTicket(): void {
    const t = this.ticket();
    if (!t) return;

    if (confirm(`¿Estás seguro de eliminar el ticket #${t.codigo}? Esta acción no se puede deshacer.`)) {
      this.ticketService.deleteTicket(t.id).subscribe({
        next: () => {
          this.router.navigate(['/tickets']);
        },
      });
    }
  }
}
