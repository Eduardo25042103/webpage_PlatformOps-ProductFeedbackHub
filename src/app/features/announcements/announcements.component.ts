import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AnnouncementService } from '../../core/services/announcement.service';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { AnnouncementType } from '../../core/models/announcement.model';
import {
  LucideMegaphone,
  LucideHistory,
  LucidePlus,
  LucideTriangleAlert,
  LucideClock,
  LucideCheckCircle2,
  LucideShieldAlert,
  LucideX,
  LucideSparkles,
  LucideCalendar,
  LucideTag,
  LucideInfo,
} from '@lucide/angular';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    LucideMegaphone,
    LucideHistory,
    LucidePlus,
    LucideTriangleAlert,
    LucideClock,
    LucideCheckCircle2,
    LucideShieldAlert,
    LucideX,
    LucideSparkles,
    LucideCalendar,
    LucideTag,
    LucideInfo,
  ],
  template: `
    <div class="space-y-6">
      <!-- HEADER & ACTIONS -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <svg lucideMegaphone class="w-6 h-6 text-opsAccent-indigo"></svg>
              <span>Avisos Operativos & Changelog (Módulos 5/6)</span>
            </h1>
            <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-card border border-surface-border text-opsText-muted">
              Canal de Comunicación TI
            </span>
          </div>
          <p class="text-xs sm:text-sm text-opsText-muted mt-1">
            Difusión de incidentes mayores, ventanas de mantenimiento programado y notas de versión en producción.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Switcher -->
          <div class="flex items-center bg-surface-card border border-surface-border rounded-lg p-1">
            <button
              (click)="activeTab.set('ANNOUNCEMENTS')"
              [class.bg-opsAccent-indigo]="activeTab() === 'ANNOUNCEMENTS'"
              [class.text-white]="activeTab() === 'ANNOUNCEMENTS'"
              [class.text-opsText-muted]="activeTab() !== 'ANNOUNCEMENTS'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
              <svg lucideMegaphone class="w-3.5 h-3.5"></svg>
              <span>Alertas & Avisos</span>
            </button>
            <button
              (click)="activeTab.set('CHANGELOG')"
              [class.bg-opsAccent-indigo]="activeTab() === 'CHANGELOG'"
              [class.text-white]="activeTab() === 'CHANGELOG'"
              [class.text-opsText-muted]="activeTab() !== 'CHANGELOG'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
              <svg lucideHistory class="w-3.5 h-3.5"></svg>
              <span>Changelog</span>
            </button>
          </div>

          <!-- New Announcement Button -->
          <app-button
            variant="primary"
            size="sm"
            (buttonClick)="openCreateModal()">
            <svg lucidePlus class="w-4 h-4"></svg>
            <span>Publicar Comunicado</span>
          </app-button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: COMUNICADOS DEL SISTEMA & ALERTAS   -->
      <!-- ========================================== -->
      @if (activeTab() === 'ANNOUNCEMENTS') {
        <div class="space-y-4">
          @for (item of announcementService.announcements(); track item.id) {
            <app-card>
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div class="space-y-2 flex-1">
                  <!-- Header Chips -->
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1"
                          [ngClass]="getTypeBadgeClass(item.tipo)">
                      @if (item.tipo === 'CAIDA_SERVICIO') {
                        <svg lucideTriangleAlert class="w-3.5 h-3.5"></svg>
                      } @else if (item.tipo === 'MANTENIMIENTO_PROGRAMADO') {
                        <svg lucideClock class="w-3.5 h-3.5"></svg>
                      } @else if (item.tipo === 'SEGURIDAD') {
                        <svg lucideShieldAlert class="w-3.5 h-3.5"></svg>
                      } @else {
                        <svg lucideInfo class="w-3.5 h-3.5"></svg>
                      }
                      <span>{{ formatType(item.tipo) }}</span>
                    </span>

                    @if (item.afectaServicio) {
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                        AFECTA DISPONIBILIDAD
                      </span>
                    }
                  </div>

                  <!-- Título & Mensaje -->
                  <h3 class="text-base font-bold text-white">{{ item.titulo }}</h3>
                  <p class="text-xs sm:text-sm text-opsText-secondary leading-relaxed">
                    {{ item.mensaje }}
                  </p>

                  <!-- Fechas de evento si aplican -->
                  @if (item.inicioEvento) {
                    <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-opsText-muted bg-surface-canvas/60 p-2 rounded-lg border border-surface-border/50 max-w-xl">
                      <div class="flex items-center gap-1.5">
                        <svg lucideCalendar class="w-3.5 h-3.5 text-opsAccent-indigo"></svg>
                        <span>Inicio: <strong class="text-white">{{ item.inicioEvento | date : 'dd/MM/yyyy HH:mm' }}</strong></span>
                      </div>
                      @if (item.finEstimado) {
                        <div class="flex items-center gap-1.5">
                          <svg lucideClock class="w-3.5 h-3.5 text-opsAccent-cyan"></svg>
                          <span>Fin Estimado: <strong class="text-white">{{ item.finEstimado | date : 'dd/MM/yyyy HH:mm' }}</strong></span>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Metadata Autor & Fecha Publicación -->
                <div class="sm:text-right shrink-0 text-xs text-opsText-muted pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-border">
                  <p class="font-medium text-white">{{ item.publicadoPorNombre }}</p>
                  <p class="text-[11px] text-opsAccent-indigo font-mono">{{ item.publicadoPorRol }}</p>
                  <p class="text-[10px] text-opsText-muted mt-1">{{ item.createdAt | date : 'medium' }}</p>
                </div>
              </div>
            </app-card>
          }
        </div>
      }

      <!-- ========================================== -->
      <!-- TAB 2: CHANGELOG & NOTAS DE VERSIÓN        -->
      <!-- ========================================== -->
      @if (activeTab() === 'CHANGELOG') {
        <div class="space-y-6">
          <div class="p-4 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold text-white flex items-center gap-2">
                <svg lucideSparkles class="w-4 h-4 text-opsAccent-indigo"></svg>
                <span>Historial de Versiones en Producción (CloudFront & Lambda)</span>
              </h2>
              <p class="text-xs text-opsText-muted mt-0.5">
                Trazabilidad continua de mejoras, despliegues y correcciones de estabilidad técnica.
              </p>
            </div>
            <span class="text-xs font-mono font-bold px-2 py-1 rounded bg-opsStatus-success/10 text-opsStatus-success border border-opsStatus-success/20">
              Versión Actual: v2.5.0
            </span>
          </div>

          <!-- Timeline -->
          <div class="relative pl-6 sm:pl-8 border-l-2 border-surface-border space-y-8">
            @for (rel of announcementService.changelogs(); track rel.id) {
              <div class="relative">
                <!-- Timeline Dot -->
                <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-surface-border bg-surface-card flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full" [ngClass]="getReleaseDotColor(rel.tipoRelease)"></div>
                </div>

                <app-card>
                  <!-- Release Header -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-border">
                    <div class="flex items-center gap-2.5">
                      <span class="font-mono text-base font-bold text-white flex items-center gap-1.5">
                        <svg lucideTag class="w-4 h-4 text-opsAccent-indigo"></svg>
                        {{ rel.versionTag }}
                      </span>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded border" [ngClass]="getReleaseBadgeClass(rel.tipoRelease)">
                        {{ rel.tipoRelease }} RELEASE
                      </span>
                    </div>
                    <div class="text-xs text-opsText-muted font-mono flex items-center gap-1.5">
                      <svg lucideCalendar class="w-3.5 h-3.5"></svg>
                      <span>{{ rel.fechaLanzamiento | date : 'longDate' }}</span>
                    </div>
                  </div>

                  <!-- Release Content -->
                  <div class="mt-3 space-y-2">
                    <h3 class="text-sm font-bold text-white">{{ rel.titulo }}</h3>
                    <p class="text-xs text-opsText-secondary leading-relaxed">
                      {{ rel.resumen }}
                    </p>

                    <!-- Bullet Points -->
                    <div class="mt-3 pt-2 border-t border-surface-border/50">
                      <p class="text-[11px] font-bold text-opsText-muted uppercase tracking-wider mb-1.5">Detalles del Despliegue:</p>
                      <ul class="space-y-1.5">
                        @for (det of rel.detalles; track det) {
                          <li class="flex items-start gap-2 text-xs text-opsText-primary">
                            <svg lucideCheckCircle2 class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"></svg>
                            <span>{{ det }}</span>
                          </li>
                        }
                      </ul>
                    </div>

                    <!-- Footer -->
                    <div class="pt-3 text-[11px] text-opsText-muted text-right">
                      Documentado por: <strong class="text-white">{{ rel.redactadoPorNombre }}</strong>
                    </div>
                  </div>
                </app-card>
              </div>
            }
          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: NUEVO COMUNICADO OPERATIVO          -->
      <!-- ========================================== -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-canvas/50">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-lg bg-opsAccent-indigo/10 text-opsAccent-indigo">
                  <svg lucideMegaphone class="w-5 h-5"></svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">Publicar Comunicado del Sistema</h3>
                  <p class="text-xs text-opsText-muted">Alerta operativa de infraestructura o política corporativa</p>
                </div>
              </div>
              <button
                (click)="closeCreateModal()"
                class="p-1 rounded-lg text-opsText-muted hover:text-white hover:bg-surface-border transition-colors">
                <svg lucideX class="w-5 h-5"></svg>
              </button>
            </div>

            <!-- Modal Form -->
            <form [formGroup]="createForm" (ngSubmit)="submitAnnouncement()" class="p-6 space-y-4">
              <!-- Tipo de Alerta -->
              <div>
                <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                  Tipo de Alerta *
                </label>
                <select
                  formControlName="tipo"
                  class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-opsAccent-indigo">
                  <option value="CAIDA_SERVICIO">Caída de Servicio (Crítico)</option>
                  <option value="MANTENIMIENTO_PROGRAMADO">Mantenimiento Programado</option>
                  <option value="COMUNICADO_OPERATIVO">Comunicado General</option>
                  <option value="SEGURIDAD">Alerta de Seguridad TI</option>
                </select>
              </div>

              <!-- Título -->
              <div>
                <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                  Título del Comunicado *
                </label>
                <input
                  type="text"
                  formControlName="titulo"
                  placeholder="Ej: Intermitencia externa en validador OSE SUNAT"
                  class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-opsText-muted focus:outline-none focus:border-opsAccent-indigo transition-colors" />
                @if (createForm.get('titulo')?.touched && createForm.get('titulo')?.hasError('required')) {
                  <p class="text-[11px] text-opsStatus-danger mt-1">El título es requerido.</p>
                }
              </div>

              <!-- Afecta Servicio Checkbox -->
              <div class="flex items-center gap-2 p-3 rounded-lg bg-surface-canvas border border-surface-border">
                <input
                  type="checkbox"
                  id="afectaServicio"
                  formControlName="afectaServicio"
                  class="w-4 h-4 rounded border-surface-border text-opsAccent-indigo focus:ring-0 focus:ring-offset-0 bg-surface-card" />
                <label for="afectaServicio" class="text-xs text-white font-medium cursor-pointer">
                  Afecta la disponibilidad activa del servicio para clientes SaaS
                </label>
              </div>

              <!-- Ventana de Tiempo (Opcional) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                    Inicio del Evento
                  </label>
                  <input
                    type="datetime-local"
                    formControlName="inicioEvento"
                    class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-opsAccent-indigo" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                    Fin Estimado
                  </label>
                  <input
                    type="datetime-local"
                    formControlName="finEstimado"
                    class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-opsAccent-indigo" />
                </div>
              </div>

              <!-- Mensaje Detallado -->
              <div>
                <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                  Mensaje / Plan de Mitigación *
                </label>
                <textarea
                  formControlName="mensaje"
                  rows="3"
                  placeholder="Detalla el impacto técnico, acciones preventivas y canales de escalación..."
                  class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-opsText-muted focus:outline-none focus:border-opsAccent-indigo transition-colors"></textarea>
                @if (createForm.get('mensaje')?.touched && createForm.get('mensaje')?.hasError('required')) {
                  <p class="text-[11px] text-opsStatus-danger mt-1">El mensaje es requerido.</p>
                }
              </div>

              <!-- Footer Buttons -->
              <div class="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
                <app-button
                  type="button"
                  variant="secondary"
                  size="sm"
                  (buttonClick)="closeCreateModal()">
                  Cancelar
                </app-button>
                <app-button
                  type="submit"
                  variant="primary"
                  size="sm"
                  [disabled]="createForm.invalid">
                  Publicar Alerta
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class AnnouncementsComponent implements OnInit {
  readonly announcementService = inject(AnnouncementService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.announcementService.loadAnnouncements().subscribe();
  }

  readonly activeTab = signal<'ANNOUNCEMENTS' | 'CHANGELOG'>('ANNOUNCEMENTS');
  readonly showCreateModal = signal<boolean>(false);

  createForm = this.fb.group({
    tipo: ['CAIDA_SERVICIO' as AnnouncementType, Validators.required],
    titulo: ['', [Validators.required, Validators.minLength(5)]],
    mensaje: ['', [Validators.required, Validators.minLength(10)]],
    afectaServicio: [true],
    inicioEvento: [''],
    finEstimado: [''],
  });

  openCreateModal(): void {
    this.createForm.reset({
      tipo: 'CAIDA_SERVICIO',
      titulo: '',
      mensaje: '',
      afectaServicio: true,
      inicioEvento: new Date().toISOString().slice(0, 16),
      finEstimado: '',
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitAnnouncement(): void {
    if (this.createForm.invalid) return;

    const val = this.createForm.value;
    const user = this.authService.currentUser();
    const authorName = user ? `${user.nombre} ${user.apellido}` : 'Operador TI';
    const authorRole = user ? user.rolCodigo : 'ADMIN';

    this.announcementService.addAnnouncement(
      {
        tipo: val.tipo as AnnouncementType,
        titulo: val.titulo!,
        mensaje: val.mensaje!,
        afectaServicio: !!val.afectaServicio,
        inicioEvento: val.inicioEvento || undefined,
        finEstimado: val.finEstimado || undefined,
      },
      authorName,
      authorRole
    );

    this.closeCreateModal();
  }

  formatType(tipo: AnnouncementType): string {
    switch (tipo) {
      case 'CAIDA_SERVICIO':
        return 'Caída de Servicio';
      case 'MANTENIMIENTO_PROGRAMADO':
        return 'Mantenimiento Programado';
      case 'SEGURIDAD':
        return 'Seguridad TI';
      case 'COMUNICADO_OPERATIVO':
        return 'Comunicado General';
      default:
        return tipo;
    }
  }

  getTypeBadgeClass(tipo: AnnouncementType): string {
    switch (tipo) {
      case 'CAIDA_SERVICIO':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'MANTENIMIENTO_PROGRAMADO':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'SEGURIDAD':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'COMUNICADO_OPERATIVO':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  }

  getReleaseBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'MAJOR':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'MINOR':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'PATCH':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  }

  getReleaseDotColor(tipo: string): string {
    switch (tipo) {
      case 'MAJOR':
        return 'bg-purple-400';
      case 'MINOR':
        return 'bg-indigo-400';
      case 'PATCH':
        return 'bg-emerald-400';
      default:
        return 'bg-slate-400';
    }
  }
}
