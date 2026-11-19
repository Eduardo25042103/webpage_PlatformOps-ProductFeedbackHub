import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import {
  LucideBuilding2,
  LucideSearch,
  LucidePhone,
  LucideUserCheck,
  LucideChevronRight,
  LucideRefreshCw,
} from '@lucide/angular';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    LucideBuilding2,
    LucideSearch,
    LucidePhone,
    LucideUserCheck,
    LucideChevronRight,
    LucideRefreshCw,
  ],
  template: `
    <div class="space-y-6">
      <!-- HEADER & ACTIONS -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Directorio de Clientes SaaS (Módulo 2)</span>
            </h1>
            <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-card border border-surface-border text-opsText-muted">
              {{ clientService.filteredClients().length }} cuentas
            </span>
          </div>
          <p class="text-xs sm:text-sm text-opsText-muted mt-1">
            Gestión comercial, validación de contactos autorizados y semáforo de retención (Churn Risk).
          </p>
        </div>

        <app-button
          variant="secondary"
          size="sm"
          (btnClick)="clientService.refreshClients()"
        >
          <svg lucideRefreshCw class="w-3.5 h-3.5"></svg>
          <span>Sincronizar</span>
        </app-button>
      </div>

      <!-- PORTFOLIO KPI SUMMARY CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <!-- KPI 1: TOTAL EMPRESAS -->
        <app-card>
          <div class="text-[11px] font-bold tracking-wider text-opsText-muted uppercase">
            Total Empresas SaaS
          </div>
          <div class="text-3xl font-bold font-display text-white mt-2">
            {{ clientService.summaryMetrics().totalAccounts }}
          </div>
          <div class="text-[11px] text-opsText-muted mt-1.5 flex items-center gap-1">
            <svg lucideBuilding2 class="w-3 h-3 text-primary"></svg>
            <span>Cuentas activas en RDS</span>
          </div>
        </app-card>

        <!-- KPI 2: CARTERA ARR -->
        <app-card>
          <div class="text-[11px] font-bold tracking-wider text-opsText-muted uppercase">
            Cartera Anual (ARR)
          </div>
          <div class="text-3xl font-bold font-display text-success mt-2">
            \${{ clientService.summaryMetrics().totalArr | number }} USD
          </div>
          <div class="text-[11px] text-opsText-muted mt-1.5">
            Ingreso anual recurrente
          </div>
        </app-card>

        <!-- KPI 3: EN RIESGO CHURN -->
        <div class="rounded-lg bg-p1-light/40 border border-p1-border p-4 sm:p-5">
          <div class="text-[11px] font-bold tracking-wider text-p1 uppercase flex items-center justify-between">
            <span>Riesgo Crítico (Churn)</span>
            <span class="w-2 h-2 rounded-full bg-p1 animate-ping"></span>
          </div>
          <div class="text-3xl font-bold font-display text-p1 mt-2">
            {{ clientService.summaryMetrics().highRiskCount }} cuenta
          </div>
          <div class="text-[11px] text-p1/80 mt-1.5">
            Supermercados Peruanos (P1s recurrentes)
          </div>
        </div>

        <!-- KPI 4: CONTACTOS VALIDADOS -->
        <app-card>
          <div class="text-[11px] font-bold tracking-wider text-opsText-muted uppercase">
            Contactos Clave
          </div>
          <div class="text-3xl font-bold font-display text-accentCyan mt-2">
            {{ clientService.summaryMetrics().totalContacts }}
          </div>
          <div class="text-[11px] text-opsText-muted mt-1.5 flex items-center gap-1">
            <svg lucideUserCheck class="w-3 h-3 text-accentCyan"></svg>
            <span>Contactos autorizados L1</span>
          </div>
        </app-card>
      </div>

      <!-- FILTER CONTROLS & SEARCH -->
      <app-card [padding]="true">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Plan Filter Tabs -->
          <div class="flex items-center flex-wrap gap-1.5">
            <button
              (click)="setPlanFilter('ALL')"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              [ngClass]="[
                clientService.filterPlan() === 'ALL'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-canvas text-opsText-secondary hover:text-white border border-surface-border'
              ]"
            >
              Todos los Planes
            </button>

            <button
              (click)="setPlanFilter('ENTERPRISE')"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              [ngClass]="[
                clientService.filterPlan() === 'ENTERPRISE'
                  ? 'bg-primary-light text-primary border border-primary font-bold'
                  : 'bg-canvas text-opsText-secondary hover:text-white border border-surface-border'
              ]"
            >
              ENTERPRISE (SLA 4h)
            </button>

            <button
              (click)="setPlanFilter('PROFESSIONAL')"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              [ngClass]="[
                clientService.filterPlan() === 'PROFESSIONAL'
                  ? 'bg-secondary-light text-secondary border border-secondary font-bold'
                  : 'bg-canvas text-opsText-secondary hover:text-white border border-surface-border'
              ]"
            >
              PROFESSIONAL (SLA 24h)
            </button>
          </div>

          <!-- Risk Selector & Search -->
          <div class="flex items-center gap-2.5 w-full md:w-auto">
            <!-- Search by RUC / Name -->
            <div class="relative flex-1 md:w-64">
              <svg lucideSearch class="w-4 h-4 text-opsText-muted absolute left-3 top-1/2 -translate-y-1/2"></svg>
              <input
                type="text"
                placeholder="Buscar por RUC o empresa..."
                [value]="clientService.searchTerm()"
                (input)="onSearchChange($event)"
                class="w-full bg-canvas border border-surface-border rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-opsText-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <!-- Churn Risk Selector -->
            <select
              [value]="clientService.filterRisk()"
              (change)="onRiskChange($event)"
              class="bg-canvas border border-surface-border rounded-md px-2.5 py-1.5 text-xs text-opsText-secondary focus:outline-none focus:border-primary"
            >
              <option value="ALL">Todo el Semáforo</option>
              <option value="BAJO">🟢 Bajo Riesgo</option>
              <option value="MEDIO">🟡 Riesgo Medio</option>
              <option value="ALTO">🔴 Alto Riesgo (Alerta)</option>
            </select>
          </div>
        </div>
      </app-card>

      <!-- CLIENTS HIGH-DENSITY TABLE -->
      <app-card [padding]="false">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-surface-border bg-canvas/60 text-[11px] font-mono uppercase tracking-wider text-opsText-muted">
                <th class="py-3 px-4">Empresa / RUC</th>
                <th class="py-3 px-4">Plan SaaS</th>
                <th class="py-3 px-4">Facturación ARR</th>
                <th class="py-3 px-4">Contacto Autorizado</th>
                <th class="py-3 px-4">Semáforo de Churn</th>
                <th class="py-3 px-4">Salud de Cuenta</th>
                <th class="py-3 px-4 text-right">Ficha 360°</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-surface-border/60">
              @for (client of clientService.filteredClients(); track client.id) {
                <tr
                  (click)="goTo360(client.id)"
                  class="hover:bg-surface-hover/80 transition-colors cursor-pointer group"
                >
                  <!-- Company Name & RUC -->
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-white group-hover:text-primary transition-colors">
                      {{ client.razonSocial }}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5 text-[11px] text-opsText-muted">
                      <span class="font-mono">RUC: {{ client.ruc }}</span>
                      @if (client.nombreComercial) {
                        <span>&bull;</span>
                        <span class="italic text-opsText-secondary">{{ client.nombreComercial }}</span>
                      }
                    </div>
                  </td>

                  <!-- Plan SaaS -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center font-mono text-[10px] font-bold px-2 py-0.5 rounded border"
                      [ngClass]="[
                        client.planCodigo === 'ENTERPRISE'
                          ? 'bg-primary-light text-primary border-primary-border'
                          : 'bg-secondary-light text-secondary border-secondary-border'
                      ]"
                    >
                      {{ client.planCodigo }}
                    </span>
                  </td>

                  <!-- Annual ARR -->
                  <td class="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-white">
                    \${{ client.montoAnualContratado | number }} USD
                  </td>

                  <!-- Main Contact -->
                  <td class="py-3.5 px-4 max-w-xs truncate">
                    @if (client.contactos.length > 0) {
                      <div class="font-medium text-white truncate">
                        {{ client.contactos[0].nombre }}
                      </div>
                      <div class="text-[10px] font-mono text-accentCyan flex items-center gap-1 mt-0.5">
                        <svg lucidePhone class="w-3 h-3 text-opsText-muted"></svg>
                        <span>{{ client.contactos[0].telefono }}</span>
                      </div>
                    } @else {
                      <span class="text-opsText-muted italic">Sin contactos</span>
                    }
                  </td>

                  <!-- Semáforo de Riesgo (Churn Risk) -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    @if (client.churnRisk === 'ALTO') {
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono bg-p1-light text-p1 border border-p1-border">
                        <span class="w-1.5 h-1.5 rounded-full bg-p1 animate-ping"></span>
                        ALTO RIESGO
                      </span>
                    } @else if (client.churnRisk === 'MEDIO') {
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono bg-p2-light text-p2 border border-p2-border">
                        <span class="w-1.5 h-1.5 rounded-full bg-p2"></span>
                        RIESGO MEDIO
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono bg-success-light text-success border border-success-border">
                        <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                        BAJO RIESGO
                      </span>
                    }
                  </td>

                  <!-- Health Score Bar -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-20 bg-canvas rounded-full h-1.5 border border-surface-border overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all"
                          [style.width.%]="client.healthScore"
                          [ngClass]="[
                            client.healthScore >= 80 ? 'bg-success' : client.healthScore >= 60 ? 'bg-p2' : 'bg-p1'
                          ]"
                        ></div>
                      </div>
                      <span class="font-mono text-[11px] font-bold text-white">
                        {{ client.healthScore }}%
                      </span>
                    </div>
                  </td>

                  <!-- Action Link -->
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <span class="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-primary-focus transition-colors">
                      <span>Ficha 360°</span>
                      <svg lucideChevronRight class="w-3.5 h-3.5"></svg>
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-12 text-center text-opsText-muted">
                    No se encontraron clientes corporativos con los criterios seleccionados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `,
})
export class ClientListComponent implements OnInit {
  readonly clientService = inject(ClientService);
  private router = inject(Router);

  ngOnInit(): void {
    this.clientService.getClients().subscribe();
  }

  setPlanFilter(plan: string): void {
    this.clientService.filterPlan.set(plan);
  }

  onRiskChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.clientService.filterRisk.set(value);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.clientService.searchTerm.set(value);
  }

  goTo360(id: number): void {
    this.router.navigate(['/clients', id]);
  }
}
