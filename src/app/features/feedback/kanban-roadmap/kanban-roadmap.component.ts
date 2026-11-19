import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FeedbackService } from '../../../core/services/feedback.service';
import { ClientService } from '../../../core/services/client.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import {
  ProductSuggestion,
  SuggestionCategory,
  SuggestionEffort,
  SuggestionStatus,
} from '../../../core/models/feedback.model';
import {
  LucideKanban,
  LucideList,
  LucidePlus,
  LucideThumbsUp,
  LucideDollarSign,
  LucideSparkles,
  LucideSearch,
  LucideCheckCircle2,
  LucideClock,
  LucideX,
  LucideBuilding2,
  LucideGripVertical,
} from '@lucide/angular';

interface ColumnDef {
  id: SuggestionStatus;
  title: string;
  badgeClass: string;
  headerBorder: string;
  dotColor: string;
}

@Component({
  selector: 'app-kanban-roadmap',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    ButtonComponent,
    CardComponent,
    LucideKanban,
    LucideList,
    LucidePlus,
    LucideThumbsUp,
    LucideDollarSign,
    LucideSparkles,
    LucideSearch,
    LucideCheckCircle2,
    LucideClock,
    LucideX,
    LucideBuilding2,
    LucideGripVertical,
  ],
  styles: [
    `
      .cdk-drag-preview {
        box-sizing: border-box;
        border-radius: 0.75rem;
        box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.5);
        border: 1px solid #6366f1;
        background-color: #1e293b;
        opacity: 0.95;
        padding: 1rem;
      }
      .cdk-drag-placeholder {
        opacity: 0.3;
        border: 2px dashed #6366f1;
        border-radius: 0.75rem;
        min-height: 120px;
        background: rgba(99, 102, 241, 0.05);
      }
      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
  template: `
    <div class="space-y-6">
      <!-- HEADER & ACTIONS -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <svg lucideKanban class="w-6 h-6 text-opsAccent-indigo"></svg>
              <span>Feedback & Tablero Kanban Roadmap (Módulo 4)</span>
            </h1>
            <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-card border border-surface-border text-opsText-muted">
              {{ feedbackService.totalSuggestions() }} iniciativas
            </span>
          </div>
          <p class="text-xs sm:text-sm text-opsText-muted mt-1">
            Priorización estratégica de requerimientos SaaS vinculados a impacto en ARR y cálculo de score RICE.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Switcher -->
          <div class="flex items-center bg-surface-card border border-surface-border rounded-lg p-1">
            <button
              (click)="activeView.set('KANBAN')"
              [class.bg-opsAccent-indigo]="activeView() === 'KANBAN'"
              [class.text-white]="activeView() === 'KANBAN'"
              [class.text-opsText-muted]="activeView() !== 'KANBAN'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              title="Vista de Tablero Kanban">
              <svg lucideKanban class="w-3.5 h-3.5"></svg>
              <span class="hidden sm:inline">Kanban</span>
            </button>
            <button
              (click)="activeView.set('MATRIX')"
              [class.bg-opsAccent-indigo]="activeView() === 'MATRIX'"
              [class.text-white]="activeView() === 'MATRIX'"
              [class.text-opsText-muted]="activeView() !== 'MATRIX'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              title="Vista de Matriz RICE & ARR">
              <svg lucideList class="w-3.5 h-3.5"></svg>
              <span class="hidden sm:inline">Matriz RICE</span>
            </button>
          </div>

          <!-- Nueva Sugerencia Button -->
          <app-button
            variant="primary"
            size="sm"
            (buttonClick)="openNewSuggestionModal()">
            <svg lucidePlus class="w-4 h-4"></svg>
            <span>Nueva Sugerencia</span>
          </app-button>
        </div>
      </div>

      <!-- BUSINESS KPI METRICS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1: ARR Impacto Total Activo -->
        <app-card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">ARR en Demanda Activa</p>
              <p class="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                \${{ feedbackService.totalArrImpactActive() | number : '1.0-0' }} <span class="text-xs text-opsText-muted font-normal">USD</span>
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-opsAccent-indigo/10 text-opsAccent-indigo border border-opsAccent-indigo/20">
              <svg lucideDollarSign class="w-5 h-5"></svg>
            </div>
          </div>
          <div class="mt-2 text-xs text-opsText-secondary flex items-center gap-1">
            <span class="text-opsStatus-success font-medium">Demanda consolidada</span> de clientes SaaS
          </div>
        </app-card>

        <!-- KPI 2: ARR En Desarrollo -->
        <app-card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">ARR en Desarrollo (Sprint)</p>
              <p class="text-xl sm:text-2xl font-bold font-mono text-opsStatus-warning mt-1">
                \${{ feedbackService.inProgressArrImpact() | number : '1.0-0' }} <span class="text-xs text-opsText-muted font-normal">USD</span>
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-opsStatus-warning/10 text-opsStatus-warning border border-opsStatus-warning/20">
              <svg lucideClock class="w-5 h-5"></svg>
            </div>
          </div>
          <div class="mt-2 text-xs text-opsText-secondary flex items-center gap-1">
            <span>{{ feedbackService.enDesarrolloList().length }} requerimientos</span> siendo codificados
          </div>
        </app-card>

        <!-- KPI 3: ARR en Roadmap -->
        <app-card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">ARR Priorizado (Roadmap)</p>
              <p class="text-xl sm:text-2xl font-bold font-mono text-opsAccent-cyan mt-1">
                \${{ feedbackService.roadmapArrImpact() | number : '1.0-0' }} <span class="text-xs text-opsText-muted font-normal">USD</span>
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-opsAccent-cyan/10 text-opsAccent-cyan border border-opsAccent-cyan/20">
              <svg lucideSparkles class="w-5 h-5"></svg>
            </div>
          </div>
          <div class="mt-2 text-xs text-opsText-secondary flex items-center gap-1">
            <span>{{ feedbackService.enRoadmapList().length }} iniciativas</span> aprobadas para Q2
          </div>
        </app-card>

        <!-- KPI 4: Features Lanzadas a Prod -->
        <app-card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-opsText-muted uppercase tracking-wider">Entregadas a Prod</p>
              <p class="text-xl sm:text-2xl font-bold font-mono text-opsStatus-success mt-1">
                {{ feedbackService.deliveredCount() }} <span class="text-xs text-opsText-muted font-normal">releases</span>
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-opsStatus-success/10 text-opsStatus-success border border-opsStatus-success/20">
              <svg lucideCheckCircle2 class="w-5 h-5"></svg>
            </div>
          </div>
          <div class="mt-2 text-xs text-opsText-secondary flex items-center gap-1">
            <span>Valor transferido</span> con éxito a clientes
          </div>
        </app-card>
      </div>

      <!-- FILTERS & SEARCH BAR -->
      <div class="bg-surface-card border border-surface-border rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <svg lucideSearch class="w-4 h-4 text-opsText-muted absolute left-3 top-1/2 -translate-y-1/2"></svg>
          <input
            type="text"
            [ngModel]="feedbackService.searchTerm()"
            (ngModelChange)="feedbackService.setSearchTerm($event)"
            placeholder="Buscar por código (#SUG-2026-...), título o cliente..."
            class="w-full bg-surface-canvas border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-opsText-muted focus:outline-none focus:border-opsAccent-indigo transition-colors" />
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          @for (cat of categories; track cat.id) {
            <button
              (click)="feedbackService.setCategory(cat.id)"
              [class.bg-opsAccent-indigo]="feedbackService.selectedCategory() === cat.id"
              [class.text-white]="feedbackService.selectedCategory() === cat.id"
              [class.bg-surface-canvas]="feedbackService.selectedCategory() !== cat.id"
              [class.text-opsText-secondary]="feedbackService.selectedCategory() !== cat.id"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border border-surface-border transition-colors whitespace-nowrap">
              {{ cat.label }}
            </button>
          }
        </div>
      </div>

      <!-- ========================================== -->
      <!-- VIEW 1: KANBAN BOARD (DRAG & DROP)         -->
      <!-- ========================================== -->
      @if (activeView() === 'KANBAN') {
        <div
          cdkDropListGroup
          class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          @for (col of kanbanColumns; track col.id) {
            <div class="bg-surface-canvas/60 border rounded-xl flex flex-col max-h-[820px] transition-colors"
                 [ngClass]="col.headerBorder">
              
              <!-- Column Header -->
              <div class="p-3 border-b border-surface-border/60 flex items-center justify-between bg-surface-card/40 rounded-t-xl">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" [ngClass]="col.dotColor"></span>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-white">
                    {{ col.title }}
                  </h3>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded-full" [ngClass]="col.badgeClass">
                    {{ getColumnItems(col.id).length }}
                  </span>
                </div>
              </div>

              <!-- Column Stats Sub-bar -->
              <div class="px-3 py-1.5 bg-surface-canvas/40 border-b border-surface-border/40 flex items-center justify-between text-[11px] text-opsText-muted">
                <span>Impacto ARR:</span>
                <span class="font-mono font-semibold text-white">
                  \${{ getColumnArr(col.id) | number : '1.0-0' }} USD
                </span>
              </div>

              <!-- CDK Drop List -->
              <div
                cdkDropList
                [cdkDropListData]="col.id"
                (cdkDropListDropped)="onDrop($event)"
                class="p-2 space-y-3 overflow-y-auto flex-1 min-h-[220px]">
                
                @for (item of getColumnItems(col.id); track item.id) {
                  <!-- KANBAN CARD -->
                  <div
                    cdkDrag
                    [cdkDragData]="item"
                    class="bg-surface-card border border-surface-border hover:border-opsAccent-indigo/50 rounded-xl p-3 shadow-md hover:shadow-lg transition-all cursor-grab active:cursor-grabbing group">
                    
                    <!-- Card Top: Code, Category, Effort -->
                    <div class="flex items-center justify-between gap-2 mb-2">
                      <div class="flex items-center gap-1.5">
                        <svg lucideGripVertical class="w-3.5 h-3.5 text-opsText-muted/40 group-hover:text-opsAccent-indigo transition-colors"></svg>
                        <span class="font-mono text-[11px] font-semibold text-opsText-muted">
                          #{{ item.codigo }}
                        </span>
                      </div>
                      <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded border" [ngClass]="getEffortClass(item.esfuerzoEstimado)">
                        {{ item.esfuerzoEstimado }}
                      </span>
                    </div>

                    <!-- Category Badge -->
                    <div class="mb-2">
                      <span class="text-[10px] font-medium px-2 py-0.5 rounded-md inline-block" [ngClass]="getCategoryBadgeClass(item.categoria)">
                        {{ formatCategory(item.categoria) }}
                      </span>
                    </div>

                    <!-- Title -->
                    <h4 class="text-xs sm:text-sm font-semibold text-white leading-snug group-hover:text-opsAccent-indigo transition-colors line-clamp-2">
                      {{ item.titulo }}
                    </h4>

                    <!-- Description -->
                    <p class="text-xs text-opsText-muted mt-1.5 line-clamp-2">
                      {{ item.descripcion }}
                    </p>

                    <!-- Requester Clients Info -->
                    @if (item.clientesSolicitantes.length > 0) {
                      <div class="mt-2.5 pt-2 border-t border-surface-border/40">
                        <div class="flex items-center gap-1 text-[11px] text-opsText-secondary">
                          <svg lucideBuilding2 class="w-3 h-3 text-opsAccent-cyan"></svg>
                          <span class="truncate font-medium">
                            {{ item.clientesSolicitantes[0].razonSocial }}
                          </span>
                          @if (item.clientesSolicitantes.length > 1) {
                            <span class="text-opsText-muted text-[10px] bg-surface-canvas px-1 rounded">
                              +{{ item.clientesSolicitantes.length - 1 }}
                            </span>
                          }
                        </div>
                      </div>
                    }

                    <!-- Business Metrics: ARR & RICE Score -->
                    <div class="mt-3 flex items-center justify-between bg-surface-canvas/60 rounded-lg p-2 border border-surface-border/40">
                      <div class="flex items-center gap-1">
                        <span class="text-[10px] text-opsText-muted">ARR:</span>
                        <span class="text-xs font-mono font-bold text-emerald-400">
                          \${{ item.montoTotalArrImpactoUsd | number : '1.0-0' }}
                        </span>
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="text-[10px] text-opsText-muted">RICE:</span>
                        <span class="text-xs font-mono font-bold text-opsAccent-indigo">
                          {{ item.scoreRice }}/100
                        </span>
                      </div>
                    </div>

                    <!-- Card Footer: Upvote Button & Release / Dev Info -->
                    <div class="mt-3 pt-2 border-t border-surface-border/40 flex items-center justify-between gap-2">
                      <!-- Upvote Button -->
                      <button
                        type="button"
                        (click)="onVoteClick($event, item.id)"
                        [class.bg-opsAccent-indigo/20]="item.haVotadoUsuarioActual"
                        [class.border-opsAccent-indigo]="item.haVotadoUsuarioActual"
                        [class.text-opsAccent-indigo]="item.haVotadoUsuarioActual"
                        [class.bg-surface-canvas]="!item.haVotadoUsuarioActual"
                        [class.border-surface-border]="!item.haVotadoUsuarioActual"
                        [class.text-opsText-muted]="!item.haVotadoUsuarioActual"
                        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border hover:border-opsAccent-indigo transition-all"
                        title="Votar por esta iniciativa">
                        <svg
                          lucideThumbsUp
                          class="w-3.5 h-3.5"
                          [class.fill-current]="item.haVotadoUsuarioActual"></svg>
                        <span class="font-mono font-bold">{{ item.votosCount }}</span>
                      </button>

                      <!-- Quick Status / Dev info -->
                      @if (item.releaseVersion) {
                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-opsStatus-success/10 text-opsStatus-success border border-opsStatus-success/20">
                          {{ item.releaseVersion }}
                        </span>
                      } @else if (item.responsableDev) {
                        <span class="text-[10px] text-opsText-muted truncate max-w-[100px]" title="{{ item.responsableDev }}">
                          {{ item.responsableDev }}
                        </span>
                      } @else {
                        <!-- Quick Move dropdown for mobile / fast status change -->
                        <select
                          [value]="item.estado"
                          (change)="onStatusSelectChange(item.id, $event)"
                          (click)="$event.stopPropagation()"
                          class="text-[10px] bg-surface-canvas border border-surface-border rounded px-1 py-0.5 text-opsText-secondary focus:outline-none">
                          <option value="EVALUACION">Eval</option>
                          <option value="EN_ROADMAP">Roadmap</option>
                          <option value="EN_DESARROLLO">Dev</option>
                          <option value="LANZADA">Lanzada</option>
                          <option value="DESCARTADA">Descartada</option>
                        </select>
                      }
                    </div>
                  </div>
                } @empty {
                  <div class="h-28 flex flex-col items-center justify-center border border-dashed border-surface-border/50 rounded-xl text-center p-3 text-opsText-muted text-xs">
                    <p>No hay requerimientos en este estado</p>
                    <span class="text-[10px] text-opsText-muted/60 mt-1">Arrastra una tarjeta aquí</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- ========================================== -->
      <!-- VIEW 2: MATRIZ RICE & ARR TABLE            -->
      <!-- ========================================== -->
      @if (activeView() === 'MATRIX') {
        <app-card>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="border-b border-surface-border text-opsText-muted font-medium uppercase text-[11px] tracking-wider bg-surface-canvas/40">
                  <th class="py-3 px-4">Código & Requerimiento</th>
                  <th class="py-3 px-3">Categoría</th>
                  <th class="py-3 px-3">Clientes Solicitantes</th>
                  <th class="py-3 px-3 text-right">ARR Demanda ($)</th>
                  <th class="py-3 px-3 text-center">Esfuerzo</th>
                  <th class="py-3 px-3 text-center">Score RICE</th>
                  <th class="py-3 px-3 text-center">Votos</th>
                  <th class="py-3 px-3 text-center">Estado</th>
                  <th class="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-border/50 text-opsText-primary">
                @for (item of feedbackService.filteredSuggestions(); track item.id) {
                  <tr class="hover:bg-surface-elevated/40 transition-colors">
                    <!-- Código & Título -->
                    <td class="py-3 px-4 max-w-xs">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-semibold text-opsAccent-indigo">
                          #{{ item.codigo }}
                        </span>
                      </div>
                      <p class="font-semibold text-white text-xs mt-0.5">{{ item.titulo }}</p>
                      <p class="text-[11px] text-opsText-muted line-clamp-1 mt-0.5">{{ item.descripcion }}</p>
                    </td>

                    <!-- Categoría -->
                    <td class="py-3 px-3 whitespace-nowrap">
                      <span class="text-[10px] font-medium px-2 py-0.5 rounded-md" [ngClass]="getCategoryBadgeClass(item.categoria)">
                        {{ formatCategory(item.categoria) }}
                      </span>
                    </td>

                    <!-- Clientes Solicitantes -->
                    <td class="py-3 px-3">
                      @if (item.clientesSolicitantes.length > 0) {
                        <div class="space-y-1">
                          @for (c of item.clientesSolicitantes; track c.clienteId) {
                            <div class="flex items-center gap-1.5 text-xs text-opsText-secondary">
                              <span class="w-1.5 h-1.5 rounded-full bg-opsAccent-cyan"></span>
                              <span class="truncate max-w-[150px]">{{ c.razonSocial }}</span>
                              <span class="text-[10px] font-mono text-emerald-400">(\${{ c.arrUsd | number }})</span>
                            </div>
                          }
                        </div>
                      } @else {
                        <span class="text-xs text-opsText-muted italic">Iniciativa interna de producto</span>
                      }
                    </td>

                    <!-- ARR Demanda -->
                    <td class="py-3 px-3 text-right whitespace-nowrap font-mono font-bold text-emerald-400">
                      \${{ item.montoTotalArrImpactoUsd | number : '1.0-0' }} USD
                    </td>

                    <!-- Esfuerzo Estimado -->
                    <td class="py-3 px-3 text-center whitespace-nowrap">
                      <span class="text-[10px] font-semibold px-2 py-0.5 rounded border" [ngClass]="getEffortClass(item.esfuerzoEstimado)">
                        {{ item.esfuerzoEstimado }}
                      </span>
                    </td>

                    <!-- Score RICE -->
                    <td class="py-3 px-3 text-center whitespace-nowrap">
                      <div class="flex flex-col items-center gap-1">
                        <span class="font-mono font-bold text-xs" [ngClass]="getRiceScoreColor(item.scoreRice)">
                          {{ item.scoreRice }} / 100
                        </span>
                        <div class="w-16 h-1.5 bg-surface-canvas rounded-full overflow-hidden border border-surface-border">
                          <div
                            class="h-full rounded-full transition-all"
                            [ngClass]="getRiceBarColor(item.scoreRice)"
                            [style.width.%]="item.scoreRice"></div>
                        </div>
                      </div>
                    </td>

                    <!-- Votos -->
                    <td class="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        (click)="feedbackService.toggleVote(item.id)"
                        [class.bg-opsAccent-indigo/20]="item.haVotadoUsuarioActual"
                        [class.text-opsAccent-indigo]="item.haVotadoUsuarioActual"
                        [class.border-opsAccent-indigo]="item.haVotadoUsuarioActual"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-surface-border hover:border-opsAccent-indigo transition-all">
                        <svg lucideThumbsUp class="w-3.5 h-3.5" [class.fill-current]="item.haVotadoUsuarioActual"></svg>
                        <span>{{ item.votosCount }}</span>
                      </button>
                    </td>

                    <!-- Estado -->
                    <td class="py-3 px-3 text-center whitespace-nowrap">
                      <select
                        [value]="item.estado"
                        (change)="onStatusSelectChange(item.id, $event)"
                        class="text-xs bg-surface-canvas border border-surface-border rounded-lg px-2 py-1 text-white focus:outline-none focus:border-opsAccent-indigo">
                        <option value="EVALUACION">EVALUACIÓN</option>
                        <option value="EN_ROADMAP">EN ROADMAP</option>
                        <option value="EN_DESARROLLO">EN DESARROLLO</option>
                        <option value="LANZADA">LANZADA</option>
                        <option value="DESCARTADA">DESCARTADA</option>
                      </select>
                    </td>

                    <!-- Acciones -->
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (item.releaseVersion) {
                        <span class="text-xs font-mono font-bold text-opsStatus-success">
                          {{ item.releaseVersion }}
                        </span>
                      } @else {
                        <span class="text-xs text-opsText-muted">
                          {{ item.responsableDev || 'Pendiente Asig.' }}
                        </span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="py-8 text-center text-opsText-muted">
                      No se encontraron iniciativas con los filtros aplicados.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }

      <!-- ========================================== -->
      <!-- MODAL: NUEVA SUGERENCIA DE PRODUCTO        -->
      <!-- ========================================== -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-canvas/50">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-lg bg-opsAccent-indigo/10 text-opsAccent-indigo">
                  <svg lucideSparkles class="w-5 h-5"></svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">Registrar Requerimiento de Producto</h3>
                  <p class="text-xs text-opsText-muted">Feedback recolectado de clientes o propuesta interna</p>
                </div>
              </div>
              <button
                (click)="closeNewSuggestionModal()"
                class="p-1 rounded-lg text-opsText-muted hover:text-white hover:bg-surface-border transition-colors">
                <svg lucideX class="w-5 h-5"></svg>
              </button>
            </div>

            <!-- Modal Form -->
            <form [formGroup]="createForm" (ngSubmit)="submitNewSuggestion()" class="p-6 space-y-4">
              <!-- Título -->
              <div>
                <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                  Título de la Iniciativa *
                </label>
                <input
                  type="text"
                  formControlName="titulo"
                  placeholder="Ej: Exportación masiva de boletas para PLE SUNAT"
                  class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-opsText-muted focus:outline-none focus:border-opsAccent-indigo transition-colors" />
                @if (createForm.get('titulo')?.touched && createForm.get('titulo')?.hasError('required')) {
                  <p class="text-[11px] text-opsStatus-danger mt-1">El título es requerido.</p>
                }
              </div>

              <!-- Categoría & Esfuerzo -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                    Categoría *
                  </label>
                  <select
                    formControlName="categoria"
                    class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-opsAccent-indigo">
                    <option value="FACTURACION_SUNAT">Facturación SUNAT</option>
                    <option value="INTEGRACIONES">Integraciones</option>
                    <option value="REPORTES_PLE">Reportes PLE</option>
                    <option value="MOBILE_POS">Mobile POS</option>
                    <option value="SEGURIDAD_UX">Seguridad / UX</option>
                    <option value="INFRAESTRUCTURA">Infraestructura</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                    Esfuerzo Técnico *
                  </label>
                  <select
                    formControlName="esfuerzoEstimado"
                    class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-opsAccent-indigo">
                    <option value="BAJO">BAJO (1-3 días)</option>
                    <option value="MEDIO">MEDIO (1 sprint)</option>
                    <option value="ALTO">ALTO (2-3 sprints)</option>
                    <option value="MUY_ALTO">MUY ALTO (Arquitectura)</option>
                  </select>
                </div>
              </div>

              <!-- Cliente Solicitante (Vincular con ARR de cliente SaaS) -->
              <div>
                <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                  Cliente Solicitante (Asocia ARR para RICE)
                </label>
                <select
                  formControlName="clienteId"
                  class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-opsAccent-indigo">
                  <option [ngValue]="null">-- Ninguno (Iniciativa Interna / Sin ARR inicial) --</option>
                  @for (c of clientService.clients(); track c.id) {
                    <option [ngValue]="c.id">
                      {{ c.razonSocial }} (\${{ c.montoAnualContratado | number }} USD ARR - {{ c.planCodigo }})
                    </option>
                  }
                </select>
                <p class="text-[11px] text-opsText-muted mt-1">
                  Vincular un cliente aumentará de forma automática el peso financiero ARR del requerimiento.
                </p>
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-xs font-medium text-opsText-secondary uppercase mb-1">
                  Descripción Detallada *
                </label>
                <textarea
                  formControlName="descripcion"
                  rows="3"
                  placeholder="Detalla la necesidad de negocio, impacto y criterios de aceptación..."
                  class="w-full bg-surface-canvas border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-opsText-muted focus:outline-none focus:border-opsAccent-indigo transition-colors"></textarea>
                @if (createForm.get('descripcion')?.touched && createForm.get('descripcion')?.hasError('required')) {
                  <p class="text-[11px] text-opsStatus-danger mt-1">La descripción es requerida.</p>
                }
              </div>

              <!-- Modal Footer -->
              <div class="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
                <app-button
                  type="button"
                  variant="secondary"
                  size="sm"
                  (buttonClick)="closeNewSuggestionModal()">
                  Cancelar
                </app-button>
                <app-button
                  type="submit"
                  variant="primary"
                  size="sm"
                  [disabled]="createForm.invalid">
                  Guardar Requerimiento
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class KanbanRoadmapComponent implements OnInit {
  readonly feedbackService = inject(FeedbackService);
  readonly clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.feedbackService.loadSuggestions().subscribe();
    this.clientService.getClients().subscribe();
  }

  readonly activeView = signal<'KANBAN' | 'MATRIX'>('KANBAN');
  readonly showCreateModal = signal<boolean>(false);

  readonly categories = [
    { id: 'TODAS' as const, label: 'Todas' },
    { id: 'FACTURACION_SUNAT' as const, label: 'Facturación SUNAT' },
    { id: 'INTEGRACIONES' as const, label: 'Integraciones' },
    { id: 'REPORTES_PLE' as const, label: 'Reportes PLE' },
    { id: 'MOBILE_POS' as const, label: 'Mobile POS' },
    { id: 'SEGURIDAD_UX' as const, label: 'Seguridad / UX' },
  ];

  readonly kanbanColumns: ColumnDef[] = [
    {
      id: 'EVALUACION',
      title: '1. Evaluación (Triage)',
      badgeClass: 'bg-slate-500/10 text-slate-300 border border-slate-500/20',
      headerBorder: 'border-slate-700/60',
      dotColor: 'bg-slate-400',
    },
    {
      id: 'EN_ROADMAP',
      title: '2. En Roadmap',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      headerBorder: 'border-indigo-500/40',
      dotColor: 'bg-indigo-400',
    },
    {
      id: 'EN_DESARROLLO',
      title: '3. En Desarrollo',
      badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      headerBorder: 'border-amber-500/40',
      dotColor: 'bg-amber-400',
    },
    {
      id: 'LANZADA',
      title: '4. Lanzada a Prod',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      headerBorder: 'border-emerald-500/40',
      dotColor: 'bg-emerald-400',
    },
    {
      id: 'DESCARTADA',
      title: '5. Descartada',
      badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      headerBorder: 'border-rose-900/40',
      dotColor: 'bg-rose-500',
    },
  ];

  createForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5)]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    categoria: ['FACTURACION_SUNAT' as SuggestionCategory, Validators.required],
    esfuerzoEstimado: ['MEDIO' as SuggestionEffort, Validators.required],
    clienteId: [null as number | null],
  });

  // CDK Drag & Drop handler
  onDrop(event: CdkDragDrop<SuggestionStatus>): void {
    const item: ProductSuggestion = event.item.data;
    const targetStatus = event.container.data;

    if (item && targetStatus && item.estado !== targetStatus) {
      this.feedbackService.updateStatus(item.id, targetStatus);
    }
  }

  getColumnItems(status: SuggestionStatus): ProductSuggestion[] {
    switch (status) {
      case 'EVALUACION':
        return this.feedbackService.evaluacionList();
      case 'EN_ROADMAP':
        return this.feedbackService.enRoadmapList();
      case 'EN_DESARROLLO':
        return this.feedbackService.enDesarrolloList();
      case 'LANZADA':
        return this.feedbackService.lanzadaList();
      case 'DESCARTADA':
        return this.feedbackService.descartadaList();
      default:
        return [];
    }
  }

  getColumnArr(status: SuggestionStatus): number {
    return this.getColumnItems(status).reduce(
      (sum, item) => sum + item.montoTotalArrImpactoUsd,
      0
    );
  }

  onVoteClick(event: MouseEvent, suggestionId: number): void {
    event.stopPropagation();
    this.feedbackService.toggleVote(suggestionId);
  }

  onStatusSelectChange(suggestionId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select && select.value) {
      this.feedbackService.updateStatus(
        suggestionId,
        select.value as SuggestionStatus
      );
    }
  }

  openNewSuggestionModal(): void {
    this.createForm.reset({
      titulo: '',
      descripcion: '',
      categoria: 'FACTURACION_SUNAT',
      esfuerzoEstimado: 'MEDIO',
      clienteId: null,
    });
    this.showCreateModal.set(true);
  }

  closeNewSuggestionModal(): void {
    this.showCreateModal.set(false);
  }

  submitNewSuggestion(): void {
    if (this.createForm.invalid) return;

    const val = this.createForm.value;
    let clientInfo;
    if (val.clienteId) {
      const found = this.clientService
        .clients()
        .find((c) => c.id === val.clienteId);
      if (found) {
        clientInfo = {
          clienteId: found.id,
          razonSocial: found.razonSocial,
          planCodigo: found.planCodigo,
          arrUsd: found.montoAnualContratado,
        };
      }
    }

    this.feedbackService.createSuggestion(
      {
        titulo: val.titulo!,
        descripcion: val.descripcion!,
        categoria: val.categoria as SuggestionCategory,
        esfuerzoEstimado: val.esfuerzoEstimado as SuggestionEffort,
        clienteId: val.clienteId ?? undefined,
      },
      clientInfo
    );

    this.closeNewSuggestionModal();
  }

  formatCategory(category: SuggestionCategory): string {
    switch (category) {
      case 'FACTURACION_SUNAT':
        return 'Facturación SUNAT';
      case 'INTEGRACIONES':
        return 'Integraciones';
      case 'REPORTES_PLE':
        return 'Reportes PLE';
      case 'MOBILE_POS':
        return 'Mobile POS';
      case 'SEGURIDAD_UX':
        return 'Seguridad / UX';
      case 'INFRAESTRUCTURA':
        return 'Infraestructura';
      default:
        return category;
    }
  }

  getCategoryBadgeClass(category: SuggestionCategory): string {
    switch (category) {
      case 'FACTURACION_SUNAT':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'INTEGRACIONES':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'REPORTES_PLE':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'MOBILE_POS':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'SEGURIDAD_UX':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  }

  getEffortClass(effort: SuggestionEffort): string {
    switch (effort) {
      case 'BAJO':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'MEDIO':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'ALTO':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'MUY_ALTO':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  }

  getRiceScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-sky-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  }

  getRiceBarColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-sky-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  }
}
