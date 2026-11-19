import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { LucideTriangleAlert, LucideRefreshCw } from '@lucide/angular';

@Component({
  selector: 'app-conflict-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LucideTriangleAlert, LucideRefreshCw],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-lg rounded-xl bg-surface-card border-2 border-p1 shadow-2xl shadow-red-950/50 p-6 relative">
          <!-- Header with Warning Icon -->
          <div class="flex items-start gap-4">
            <div class="h-12 w-12 rounded-xl bg-p1-light border border-p1-border flex items-center justify-center text-p1 shrink-0">
              <svg lucideTriangleAlert class="w-6 h-6"></svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-p1-light text-p1 border border-p1-border">
                  HTTP 409 CONFLICT
                </span>
                <span class="text-xs font-mono text-opsText-muted">Optimistic Locking</span>
              </div>
              <h3 class="text-lg font-bold text-white mt-1">
                Conflicto de Concurrencia Detectado
              </h3>
              <p class="text-xs text-opsText-secondary mt-1 leading-relaxed">
                Otro colaborador actualizó este incidente milisegundos antes en la base de datos MySQL (Amazon RDS). Tu cambio no fue sobrescrito para evitar pérdida de datos (Lost Update Problem).
              </p>
            </div>
          </div>

          <!-- Version Comparison Box -->
          <div class="my-5 p-4 rounded-lg bg-canvas border border-surface-border grid grid-cols-2 gap-4">
            <div class="p-3 rounded bg-surface-card border border-surface-border text-center">
              <div class="text-[10px] font-mono uppercase text-opsText-muted">
                Versión en tu Pantalla
              </div>
              <div class="text-2xl font-mono font-bold text-opsText-secondary mt-1">
                v{{ clientVersion() }}
              </div>
              <div class="text-[10px] text-p1 mt-0.5">Desactualizada</div>
            </div>

            <div class="p-3 rounded bg-p1-light border border-p1-border text-center">
              <div class="text-[10px] font-mono uppercase text-p1 font-semibold">
                Versión en Amazon RDS
              </div>
              <div class="text-2xl font-mono font-bold text-p1 mt-1">
                v{{ serverVersion() }}
              </div>
              <div class="text-[10px] text-success mt-0.5 font-medium">Último estado vigente</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
            <app-button variant="secondary" size="sm" (btnClick)="onCancel()">
              Cerrar sin guardar
            </app-button>

            <app-button variant="danger" size="sm" (btnClick)="onReload()">
              <svg lucideRefreshCw class="w-4 h-4"></svg>
              <span>Recargar Última Versión</span>
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConflictDialogComponent {
  isOpen = input<boolean>(false);
  clientVersion = input<number>(1);
  serverVersion = input<number>(2);

  reload = output<void>();
  cancel = output<void>();

  onReload(): void {
    this.reload.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
