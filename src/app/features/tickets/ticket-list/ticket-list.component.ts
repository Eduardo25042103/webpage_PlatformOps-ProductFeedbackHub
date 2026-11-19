import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { PriorityBadgeComponent } from '../../../shared/components/badge/priority-badge.component';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import {
  LucideTicket,
  LucidePlus,
  LucideSearch,
  LucideBuilding2,
  LucidePhone,
  LucideUser,
  LucidePaperclip,
  LucideRefreshCw,
  LucideChevronRight,
} from '@lucide/angular';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    PriorityBadgeComponent,
    StatusBadgeComponent,
    ButtonComponent,
    CardComponent,
    LucideTicket,
    LucidePlus,
    LucideSearch,
    LucideBuilding2,
    LucidePhone,
    LucideUser,
    LucidePaperclip,
    LucideRefreshCw,
    LucideChevronRight,
  ],
  template: `
    <div class="space-y-6">
      <!-- HEADER & ACTIONS -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Bandeja de Incidentes Técnicos</span>
            </h1>
            <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-card border border-surface-border text-opsText-muted">
              {{ ticketService.filteredTickets().length }} incidentes
            </span>
          </div>
          <p class="text-xs sm:text-sm text-opsText-muted mt-1">
            Gestión transaccional de fallas con control de concurrencia optimista (HTTP 409) y adjuntos en Amazon S3.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <app-button
            variant="secondary"
            size="sm"
            (btnClick)="ticketService.refreshTickets()"
          >
            <svg lucideRefreshCw class="w-3.5 h-3.5"></svg>
            <span>Refrescar</span>
          </app-button>

          <app-button
            variant="primary"
            size="sm"
            (btnClick)="goToCreate()"
          >
            <svg lucidePlus class="w-3.5 h-3.5"></svg>
            <span>+ Nueva Incidencia (S3)</span>
          </app-button>
        </div>
      </div>

      <!-- FILTER TABS & SEARCH BAR -->
      <app-card [padding]="true">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Priority Tabs -->
          <div class="flex items-center flex-wrap gap-1.5">
            <button
              (click)="setPriorityFilter('ALL')"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              [ngClass]="[
                ticketService.filterPriority() === 'ALL'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-canvas text-opsText-secondary hover:text-white hover:bg-surface-hover border border-surface-border'
              ]"
            >
              Todos ({{ ticketService.tickets().length }})
            </button>

            <button
              (click)="setPriorityFilter('P1')"
              class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
              [ngClass]="[
                ticketService.filterPriority() === 'P1'
                  ? 'bg-p1-light text-p1 border border-p1 font-bold'
                  : 'bg-canvas text-p1/80 hover:text-p1 hover:bg-p1-light/30 border border-surface-border'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-p1"></span>
              <span>P1 Crítico ({{ p1Count() }})</span>
            </button>

            <button
              (click)="setPriorityFilter('P2')"
              class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
              [ngClass]="[
                ticketService.filterPriority() === 'P2'
                  ? 'bg-p2-light text-p2 border border-p2 font-bold'
                  : 'bg-canvas text-p2/80 hover:text-p2 hover:bg-p2-light/30 border border-surface-border'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-p2"></span>
              <span>P2 Alta ({{ p2Count() }})</span>
            </button>

            <button
              (click)="setPriorityFilter('P3')"
              class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
              [ngClass]="[
                ticketService.filterPriority() === 'P3'
                  ? 'bg-p3-light text-p3 border border-p3 font-bold'
                  : 'bg-canvas text-p3/80 hover:text-p3 hover:bg-p3-light/30 border border-surface-border'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-p3"></span>
              <span>P3 Media ({{ p3Count() }})</span>
            </button>

            <button
              (click)="setPriorityFilter('P4')"
              class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
              [ngClass]="[
                ticketService.filterPriority() === 'P4'
                  ? 'bg-p4-light text-p4 border border-p4 font-bold'
                  : 'bg-canvas text-opsText-muted hover:text-white border border-surface-border'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-p4"></span>
              <span>P4 Baja</span>
            </button>
          </div>

          <!-- Search & Status Dropdown -->
          <div class="flex items-center gap-2.5 w-full md:w-auto">
            <!-- Search Bar -->
            <div class="relative flex-1 md:w-64">
              <svg lucideSearch class="w-4 h-4 text-opsText-muted absolute left-3 top-1/2 -translate-y-1/2"></svg>
              <input
                type="text"
                placeholder="Buscar por código, cliente o asunto..."
                [value]="ticketService.searchTerm()"
                (input)="onSearchChange($event)"
                class="w-full bg-canvas border border-surface-border rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-opsText-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <!-- Status Filter Selector -->
            <select
              [value]="ticketService.filterStatus()"
              (change)="onStatusChange($event)"
              class="bg-canvas border border-surface-border rounded-md px-2.5 py-1.5 text-xs text-opsText-secondary focus:outline-none focus:border-primary"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="NUEVO">NUEVO</option>
              <option value="EN_DIAGNOSTICO">EN DIAGNÓSTICO</option>
              <option value="EN_DESARROLLO">EN DESARROLLO</option>
              <option value="EN_QA">EN QA</option>
              <option value="RESUELTO">RESUELTO</option>
              <option value="CERRADO">CERRADO</option>
            </select>
          </div>
        </div>
      </app-card>

      <!-- TICKETS TABLE (Datadog/Linear High Density Style) -->
      <div class="rounded-lg border border-surface-border bg-surface-card overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <!-- Table Header -->
            <thead>
              <tr class="border-b border-surface-border bg-canvas/60 text-[11px] font-mono uppercase tracking-wider text-opsText-muted">
                <th class="py-3 px-4">Código & Versión</th>
                <th class="py-3 px-4">Incidente / Cliente</th>
                <th class="py-3 px-4">Prioridad</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4">Teléfono Directo</th>
                <th class="py-3 px-4">Asignado</th>
                <th class="py-3 px-4">Adjuntos S3</th>
                <th class="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>

            <!-- Table Body -->
            <tbody class="divide-y divide-surface-border/60">
              @for (ticket of ticketService.filteredTickets(); track ticket.id) {
                <tr
                  (click)="goToDetail(ticket.id)"
                  class="hover:bg-surface-hover/80 transition-colors cursor-pointer group"
                >
                  <!-- Code & Concurrency Version -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <span class="font-mono font-bold text-white group-hover:text-primary transition-colors">
                        #{{ ticket.codigo }}
                      </span>
                      <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-border/80 text-opsText-muted">
                        v{{ ticket.version }}
                      </span>
                    </div>
                  </td>

                  <!-- Title & Client -->
                  <td class="py-3.5 px-4 max-w-md">
                    <div class="font-semibold text-white truncate group-hover:text-primary transition-colors">
                      {{ ticket.titulo }}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5 text-[11px] text-opsText-secondary">
                      <span class="flex items-center gap-1 text-opsText-muted">
                        <svg lucideBuilding2 class="w-3 h-3"></svg>
                        <span>{{ ticket.clienteNombre }}</span>
                      </span>
                      <span class="text-opsText-muted font-mono text-[10px]">({{ ticket.clientePlan }})</span>
                    </div>
                  </td>

                  <!-- Priority Badge -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <app-priority-badge [priority]="ticket.prioridad" size="sm"></app-priority-badge>
                  </td>

                  <!-- Status Badge -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <app-status-badge [status]="ticket.estado" size="sm"></app-status-badge>
                  </td>

                  <!-- Contact Phone -->
                  <td class="py-3.5 px-4 whitespace-nowrap text-opsText-secondary font-mono text-[11px]">
                    <div class="flex items-center gap-1">
                      <svg lucidePhone class="w-3 h-3 text-opsText-muted"></svg>
                      <span>{{ ticket.telefonoContacto }}</span>
                    </div>
                  </td>

                  <!-- Assignee -->
                  <td class="py-3.5 px-4 whitespace-nowrap text-opsText-secondary">
                    @if (ticket.asignadoANombre) {
                      <div class="flex items-center gap-1.5 text-secondary font-medium">
                        <svg lucideUser class="w-3.5 h-3.5"></svg>
                        <span>{{ ticket.asignadoANombre }}</span>
                      </div>
                    } @else {
                      <span class="text-opsText-muted italic">Sin asignar</span>
                    }
                  </td>

                  <!-- Attachments S3 -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    @if (ticket.adjuntos.length > 0) {
                      <span class="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-canvas border border-surface-border text-accentCyan">
                        <svg lucidePaperclip class="w-3 h-3"></svg>
                        <span>{{ ticket.adjuntos.length }}</span>
                      </span>
                    } @else {
                      <span class="text-opsText-muted font-mono text-[11px]">-</span>
                    }
                  </td>

                  <!-- Action Button -->
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <span class="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-primary-focus transition-colors">
                      <span>Ver</span>
                      <svg lucideChevronRight class="w-3.5 h-3.5"></svg>
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="py-12 text-center text-opsText-muted">
                    <div class="max-w-xs mx-auto space-y-2">
                      <svg lucideTicket class="w-8 h-8 mx-auto text-opsText-muted opacity-40"></svg>
                      <div class="text-sm font-semibold text-white">No se encontraron incidentes</div>
                      <p class="text-xs text-opsText-muted">
                        No hay tickets que coincidan con los filtros o el término de búsqueda ingresado.
                      </p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class TicketListComponent implements OnInit {
  readonly ticketService = inject(TicketService);
  private router = inject(Router);

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe();
  }

  p1Count = computed(
    () => this.ticketService.tickets().filter((t) => t.prioridad === 'P1').length
  );
  p2Count = computed(
    () => this.ticketService.tickets().filter((t) => t.prioridad === 'P2').length
  );
  p3Count = computed(
    () => this.ticketService.tickets().filter((t) => t.prioridad === 'P3').length
  );

  setPriorityFilter(priority: string): void {
    this.ticketService.filterPriority.set(priority);
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.ticketService.filterStatus.set(value);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.ticketService.searchTerm.set(value);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/tickets', id]);
  }

  goToCreate(): void {
    this.router.navigate(['/tickets', 'new']);
  }
}
