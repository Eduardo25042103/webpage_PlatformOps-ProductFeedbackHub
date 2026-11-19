import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { InputTextComponent } from '../../../shared/components/input/input-text.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import {
  LucideArrowLeft,
  LucideUploadCloud,
  LucidePaperclip,
  LucideTrash2,
} from '@lucide/angular';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextComponent,
    ButtonComponent,
    CardComponent,
    LucideArrowLeft,
    LucideUploadCloud,
    LucidePaperclip,
    LucideTrash2,
  ],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- HEADER & BACK BUTTON -->
      <div class="flex items-center justify-between pb-3 border-b border-surface-border">
        <div class="flex items-center gap-3">
          <a
            routerLink="/tickets"
            class="p-2 rounded-lg bg-surface-card border border-surface-border text-opsText-secondary hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg lucideArrowLeft class="w-4 h-4"></svg>
          </a>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Reportar Nueva Incidencia Técnica
            </h1>
            <p class="text-xs text-opsText-muted mt-0.5">
              Registro formal con bloqueo optimista y transferencia de evidencias a Amazon S3.
            </p>
          </div>
        </div>

        <span class="text-xs font-mono px-2.5 py-1 rounded bg-canvas border border-surface-border text-opsText-muted hidden sm:inline-block">
          Canal: WEB_ANGULAR
        </span>
      </div>

      <!-- FORM -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <app-card [padding]="true">
          <div class="text-xs font-bold uppercase tracking-wider text-opsText-muted mb-4">
            1. Datos del Incidente y Cliente Afectado
          </div>

          <div class="space-y-4">
            <!-- Título -->
            <app-input-text
              formControlName="titulo"
              label="Asunto o Resumen del Incidente *"
              placeholder="Ej: Falla en timbrado SOAP de notas de crédito SUNAT..."
              [error]="titleError()"
            ></app-input-text>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Cliente SaaS -->
              <div>
                <label class="block text-xs font-semibold text-opsText-muted uppercase tracking-wider mb-1.5">
                  Empresa Cliente SaaS *
                </label>
                <select
                  formControlName="clienteId"
                  class="w-full bg-canvas border border-surface-border rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option [value]="101">Supermercados Peruanos S.A.C. (ENTERPRISE)</option>
                  <option [value]="102">Alicorp S.A.A. (ENTERPRISE)</option>
                  <option [value]="103">Ferreyros S.A. (PROFESSIONAL)</option>
                  <option [value]="104">Rímac Seguros y Reaseguros (ENTERPRISE)</option>
                  <option [value]="105">Leche Gloria S.A. (ENTERPRISE)</option>
                  <option [value]="106">Corporación Lindley S.A. (PROFESSIONAL)</option>
                  <option [value]="107">InRetail Pharma S.A. - Inkafarma (PROFESSIONAL)</option>
                </select>
              </div>

              <!-- Teléfono Directo Obligatorio -->
              <app-input-text
                formControlName="telefonoContacto"
                label="Teléfono Directo de Contacto (Obligatorio) *"
                placeholder="+51 987 654 321"
                [error]="phoneError()"
              ></app-input-text>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Prioridad Técnica -->
              <div>
                <label class="block text-xs font-semibold text-opsText-muted uppercase tracking-wider mb-1.5">
                  Nivel de Severidad (SLA) *
                </label>
                <select
                  formControlName="prioridadId"
                  class="w-full bg-canvas border border-surface-border rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option [value]="1">P1 Crítica (Servicio Caído - SLA 15 min)</option>
                  <option [value]="2">P2 Alta (Bloqueo Operativo - SLA 1 hora)</option>
                  <option [value]="3">P3 Media (Degradación Parcial - SLA 4 horas)</option>
                  <option [value]="4">P4 Baja (Consulta Menor - SLA 8 horas)</option>
                </select>
              </div>

              <!-- Categoría Técnica -->
              <div>
                <label class="block text-xs font-semibold text-opsText-muted uppercase tracking-wider mb-1.5">
                  Categoría Técnica *
                </label>
                <select
                  formControlName="categoriaId"
                  class="w-full bg-canvas border border-surface-border rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option [value]="1">Firma Electrónica & Certificados</option>
                  <option [value]="2">Base de Datos & Transacciones</option>
                  <option [value]="3">Autenticación & Accesos</option>
                  <option [value]="4">Impresión & Reportes</option>
                  <option [value]="5">API & Integraciones</option>
                  <option [value]="6">Otro Requerimiento</option>
                </select>
              </div>
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-xs font-semibold text-opsText-muted uppercase tracking-wider mb-1.5">
                Descripción Técnica Detallada *
              </label>
              <textarea
                formControlName="descripcion"
                rows="4"
                placeholder="Detalla los pasos para reproducir la falla, código de error recibido o impacto en producción..."
                class="w-full bg-canvas border border-surface-border rounded-md px-3.5 py-2.5 text-sm text-white placeholder-opsText-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                [ngClass]="{ 'border-p1': descriptionError() }"
              ></textarea>
              @if (descriptionError()) {
                <p class="mt-1 text-xs text-p1 font-medium">{{ descriptionError() }}</p>
              }
            </div>
          </div>
        </app-card>

        <!-- S3 ATTACHMENTS UPLOADER -->
        <app-card [padding]="true">
          <div class="text-xs font-bold uppercase tracking-wider text-opsText-muted mb-4 flex items-center justify-between">
            <span>2. Evidencias Multimedia y Archivos de Log (Amazon S3)</span>
            <span class="text-[10px] font-mono text-accentCyan">Presigned URL S3</span>
          </div>

          <!-- Dropzone -->
          <div
            (click)="fileInput.click()"
            class="border-2 border-dashed border-surface-border hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-colors bg-canvas/40 hover:bg-canvas/80"
          >
            <input
              #fileInput
              type="file"
              multiple
              (change)="onFilesSelected($event)"
              class="hidden"
              accept=".png,.jpg,.jpeg,.pdf,.log,.txt"
            />
            <svg lucideUploadCloud class="w-10 h-10 mx-auto text-primary mb-2 opacity-80"></svg>
            <div class="text-sm font-semibold text-white">
              Haz clic para seleccionar evidencias o capturas de pantalla
            </div>
            <p class="text-xs text-opsText-muted mt-1">
              Archivos permitidos: PNG, JPG, PDF, LOG, TXT (hasta 10 MB por archivo)
            </p>
          </div>

          <!-- Staged Files List -->
          @if (stagedFiles().length > 0) {
            <div class="mt-4 space-y-2">
              <div class="text-[11px] font-semibold text-opsText-secondary uppercase">
                Archivos listos para subir a S3 ({{ stagedFiles().length }}):
              </div>
              @for (file of stagedFiles(); track file.name; let idx = $index) {
                <div class="flex items-center justify-between p-2.5 rounded bg-canvas border border-surface-border text-xs">
                  <div class="flex items-center gap-2 text-white font-mono truncate">
                    <svg lucidePaperclip class="w-3.5 h-3.5 text-accentCyan shrink-0"></svg>
                    <span class="truncate">{{ file.name }}</span>
                    <span class="text-opsText-muted text-[10px]">
                      ({{ (file.size / 1024).toFixed(1) }} KB)
                    </span>
                  </div>

                  <button
                    type="button"
                    (click)="removeFile(idx)"
                    class="p-1 text-opsText-muted hover:text-p1 rounded transition-colors"
                  >
                    <svg lucideTrash2 class="w-3.5 h-3.5"></svg>
                  </button>
                </div>
              }
            </div>
          }
        </app-card>

        <!-- ACTION BUTTONS -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <app-button
            type="button"
            variant="secondary"
            routerLink="/tickets"
          >
            Cancelar
          </app-button>

          <app-button
            type="submit"
            variant="primary"
            [loading]="isSubmitting()"
          >
            <span>Crear Ticket y Enviar a TI</span>
          </app-button>
        </div>
      </form>
    </div>
  `,
})
export class TicketFormComponent {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false);
  stagedFiles = signal<File[]>([]);

  form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(8)]],
    clienteId: [101, [Validators.required]],
    telefonoContacto: ['+51 987 654 321', [Validators.required, Validators.minLength(7)]],
    prioridadId: [2, [Validators.required]],
    categoriaId: [1, [Validators.required]],
    descripcion: ['', [Validators.required, Validators.minLength(15)]],
  });

  titleError(): string | null {
    const c = this.form.get('titulo');
    if (c?.touched && c?.errors) {
      if (c.errors['required']) return 'El título del incidente es obligatorio';
      if (c.errors['minlength']) return 'Debe tener al menos 8 caracteres explicativos';
    }
    return null;
  }

  phoneError(): string | null {
    const c = this.form.get('telefonoContacto');
    if (c?.touched && c?.errors) {
      if (c.errors['required']) return 'El teléfono de contacto directo es obligatorio';
      if (c.errors['minlength']) return 'Ingresa un número telefónico válido';
    }
    return null;
  }

  descriptionError(): string | null {
    const c = this.form.get('descripcion');
    if (c?.touched && c?.errors) {
      if (c.errors['required']) return 'La descripción técnica es obligatoria';
      if (c.errors['minlength']) return 'Explica con al menos 15 caracteres la falla';
    }
    return null;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      this.stagedFiles.update((prev) => [...prev, ...newFiles]);
    }
  }

  removeFile(index: number): void {
    this.stagedFiles.update((prev) => prev.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const val = this.form.value;

    this.ticketService
      .createTicket({
        titulo: val.titulo,
        clienteId: Number(val.clienteId),
        telefonoContacto: val.telefonoContacto,
        prioridadId: Number(val.prioridadId),
        categoriaId: Number(val.categoriaId),
        descripcion: val.descripcion,
      })
      .subscribe({
        next: (created) => {
          // Si hay adjuntos subirlos a S3
          const files = this.stagedFiles();
          for (const file of files) {
            this.ticketService.uploadAttachment(created.id, file);
          }

          this.isSubmitting.set(false);
          this.router.navigate(['/tickets', created.id]);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }
}
