import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import {
  CreateSuggestionDto,
  ProductSuggestion,
  RequestingClientInfo,
  SuggestionCategory,
  SuggestionStatus,
} from '../models/feedback.model';
import { DEMO_SUGGESTIONS } from '../data/demo-suggestions.data';
import { environment } from '../../../environments/environment';

const FEEDBACK_STORAGE_KEY = 'opshub_feedback_data';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private http = inject(HttpClient);

  private suggestionsSignal = signal<ProductSuggestion[]>(this.getStoredSuggestions());
  private selectedCategorySignal = signal<SuggestionCategory | 'TODAS'>('TODAS');
  private searchTermSignal = signal<string>('');
  private loadingSignal = signal<boolean>(false);

  // Readonly signals
  readonly suggestions = this.suggestionsSignal.asReadonly();
  readonly selectedCategory = this.selectedCategorySignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  // Computed: Lista filtrada por texto y categoría
  readonly filteredSuggestions = computed(() => {
    const list = this.suggestionsSignal();
    const cat = this.selectedCategorySignal();
    const term = this.searchTermSignal().trim().toLowerCase();

    return list.filter((item) => {
      const matchCat = cat === 'TODAS' || item.categoria === cat;
      const matchTerm =
        !term ||
        item.codigo.toLowerCase().includes(term) ||
        item.titulo.toLowerCase().includes(term) ||
        item.descripcion.toLowerCase().includes(term);

      return matchCat && matchTerm;
    });
  });

  // Computed columns for Kanban
  readonly evaluacionList = computed(() =>
    this.filteredSuggestions().filter((s) => s.estado === 'EVALUACION')
  );

  readonly enRoadmapList = computed(() =>
    this.filteredSuggestions().filter((s) => s.estado === 'EN_ROADMAP')
  );

  readonly enDesarrolloList = computed(() =>
    this.filteredSuggestions().filter((s) => s.estado === 'EN_DESARROLLO')
  );

  readonly descartadaList = computed(() =>
    this.filteredSuggestions().filter((s) => s.estado === 'DESCARTADA')
  );

  readonly lanzadaList = computed(() =>
    this.filteredSuggestions().filter((s) => s.estado === 'LANZADA')
  );

  // Computed Metrics & Business KPIs
  readonly totalSuggestions = computed(() => this.suggestionsSignal().length);

  readonly totalArrImpactActive = computed(() =>
    this.suggestionsSignal()
      .filter((s) => s.estado !== 'DESCARTADA')
      .reduce((sum, s) => sum + s.montoTotalArrImpactoUsd, 0)
  );

  readonly inProgressArrImpact = computed(() =>
    this.suggestionsSignal()
      .filter((s) => s.estado === 'EN_DESARROLLO')
      .reduce((sum, s) => sum + s.montoTotalArrImpactoUsd, 0)
  );

  readonly roadmapArrImpact = computed(() =>
    this.suggestionsSignal()
      .filter((s) => s.estado === 'EN_ROADMAP')
      .reduce((sum, s) => sum + s.montoTotalArrImpactoUsd, 0)
  );

  readonly deliveredCount = computed(
    () => this.suggestionsSignal().filter((s) => s.estado === 'LANZADA').length
  );

  constructor() {
    if (this.suggestionsSignal().length === 0) {
      this.saveSuggestions(DEMO_SUGGESTIONS);
    }
  }

  setCategory(category: SuggestionCategory | 'TODAS'): void {
    this.selectedCategorySignal.set(category);
  }

  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
  }

  /**
   * Carga sugerencias desde el backend (GET /api/v1/feedback/sugerencias)
   */
  loadSuggestions(): Observable<ProductSuggestion[]> {
    const url = `${environment.apiUrl}/feedback/sugerencias`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const rawList = res?.data || (Array.isArray(res) ? res : null);
        if (rawList && Array.isArray(rawList) && rawList.length > 0) {
          const mapped: ProductSuggestion[] = rawList.map((item: any) => ({
            id: item.id,
            codigo: item.codigo,
            titulo: item.titulo,
            descripcion: item.descripcion || '',
            categoria: item.categoria || 'FACTURACION_SUNAT',
            estado: item.estado || 'EVALUACION',
            votosCount: item.votosCount || 0,
            montoTotalArrImpactoUsd: item.montoTotalArrImpactoUsd || 0,
            esfuerzoEstimado: item.esfuerzoEstimado || 'MEDIO',
            scoreRice: item.scoreRice || 50,
            clientesSolicitantes: item.clientesSolicitantes || [],
            responsableDev: item.responsableDev,
            releaseVersion: item.releaseVersion,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
            haVotadoUsuarioActual: item.haVotadoUsuarioActual || false,
          }));
          this.saveSuggestions(mapped);
          return mapped;
        }
        return this.suggestionsSignal();
      }),
      catchError(() => {
        return of(this.suggestionsSignal());
      })
    );
  }

  /**
   * Actualiza el estado de la sugerencia (PUT /api/v1/feedback/sugerencias/{id}/priorizar)
   */
  updateStatus(suggestionId: number, newStatus: SuggestionStatus): void {
    const url = `${environment.apiUrl}/feedback/sugerencias/${suggestionId}/priorizar`;

    this.http.put<any>(url, { nuevoEstado: newStatus }).pipe(
      catchError(() => of(null))
    ).subscribe();

    // Actualización reactiva optimista local
    this.suggestionsSignal.update((list) => {
      const updated = list.map((item) => {
        if (item.id === suggestionId) {
          return {
            ...item,
            estado: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      });
      this.saveSuggestions(updated);
      return updated;
    });
  }

  /**
   * Votar por una sugerencia (POST /api/v1/feedback/sugerencias/{id}/votar)
   */
  toggleVote(suggestionId: number): void {
    const url = `${environment.apiUrl}/feedback/sugerencias/${suggestionId}/votar`;

    this.http.post<any>(url, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    // Actualización reactiva optimista local
    this.suggestionsSignal.update((list) => {
      const updated = list.map((item) => {
        if (item.id === suggestionId) {
          const hasVoted = !!item.haVotadoUsuarioActual;
          const newVotes = hasVoted ? item.votosCount - 1 : item.votosCount + 1;
          return {
            ...item,
            votosCount: Math.max(0, newVotes),
            haVotadoUsuarioActual: !hasVoted,
            scoreRice: Math.min(
              100,
              hasVoted ? item.scoreRice - 3 : item.scoreRice + 3
            ),
          };
        }
        return item;
      });
      this.saveSuggestions(updated);
      return updated;
    });
  }

  /**
   * Registra una nueva sugerencia (POST /api/v1/feedback/sugerencias)
   */
  createSuggestion(
    dto: CreateSuggestionDto,
    client?: RequestingClientInfo
  ): ProductSuggestion {
    const url = `${environment.apiUrl}/feedback/sugerencias`;

    const payload = {
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      categoria: dto.categoria,
      esfuerzoEstimado: dto.esfuerzoEstimado,
      clienteId: client?.clienteId,
    };

    this.http.post<any>(url, payload).pipe(
      catchError(() => of(null))
    ).subscribe();

    // Inserción reactiva local
    const nextId =
      Math.max(...this.suggestionsSignal().map((s) => s.id), 0) + 1;
    const formattedCode = `SUG-2026-${String(nextId).padStart(3, '0')}`;

    const effortWeights = {
      BAJO: 85,
      MEDIO: 70,
      ALTO: 55,
      MUY_ALTO: 35,
    };
    const baseRice = effortWeights[dto.esfuerzoEstimado] || 60;
    const clientArr = client ? client.arrUsd : 0;
    const riceBonus = clientArr > 10000 ? 10 : clientArr > 0 ? 5 : 0;
    const calculatedRice = Math.min(100, baseRice + riceBonus);

    const newSuggestion: ProductSuggestion = {
      id: nextId,
      codigo: formattedCode,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      categoria: dto.categoria,
      estado: 'EVALUACION',
      votosCount: 1,
      montoTotalArrImpactoUsd: clientArr,
      esfuerzoEstimado: dto.esfuerzoEstimado,
      scoreRice: calculatedRice,
      clientesSolicitantes: client ? [client] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      haVotadoUsuarioActual: true,
    };

    const updated = [newSuggestion, ...this.suggestionsSignal()];
    this.saveSuggestions(updated);
    this.suggestionsSignal.set(updated);
    return newSuggestion;
  }

  private getStoredSuggestions(): ProductSuggestion[] {
    try {
      const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      return data ? JSON.parse(data) : DEMO_SUGGESTIONS;
    } catch {
      return DEMO_SUGGESTIONS;
    }
  }

  private saveSuggestions(items: ProductSuggestion[]): void {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }
}
