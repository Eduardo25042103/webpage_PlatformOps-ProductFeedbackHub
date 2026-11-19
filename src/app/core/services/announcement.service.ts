import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import {
  ChangelogRelease,
  CreateAnnouncementDto,
  SystemAnnouncement,
} from '../models/announcement.model';
import {
  DEMO_ANNOUNCEMENTS,
  DEMO_CHANGELOGS,
} from '../data/demo-announcements.data';
import { environment } from '../../../environments/environment';

const ANNOUNCEMENTS_STORAGE_KEY = 'opshub_announcements_data';
const CHANGELOG_STORAGE_KEY = 'opshub_changelogs_data';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private http = inject(HttpClient);

  private announcementsSignal = signal<SystemAnnouncement[]>(this.getStoredAnnouncements());
  private changelogsSignal = signal<ChangelogRelease[]>(this.getStoredChangelogs());
  private dismissedAlertIdsSignal = signal<number[]>([]);

  // Public readonly signals
  readonly announcements = this.announcementsSignal.asReadonly();
  readonly changelogs = this.changelogsSignal.asReadonly();
  readonly dismissedAlertIds = this.dismissedAlertIdsSignal.asReadonly();

  // Computed: Alerta activa que afecta el servicio (para mostrar en TopBar y Dashboard)
  readonly activeServiceAlert = computed(() => {
    const dismissed = this.dismissedAlertIdsSignal();
    return (
      this.announcementsSignal().find(
        (a) => a.afectaServicio && !dismissed.includes(a.id)
      ) || null
    );
  });

  // Computed count
  readonly criticalCount = computed(
    () =>
      this.announcementsSignal().filter((a) => a.tipo === 'CAIDA_SERVICIO')
        .length
  );

  constructor() {
    if (this.announcementsSignal().length === 0) {
      this.saveAnnouncements(DEMO_ANNOUNCEMENTS);
    }
    if (this.changelogsSignal().length === 0) {
      this.saveChangelogs(DEMO_CHANGELOGS);
    }
  }

  // Dismiss alert locally
  dismissAlert(id: number): void {
    this.dismissedAlertIdsSignal.update((ids) => [...ids, id]);
  }

  /**
   * Carga comunicados y changelog desde el backend (GET /api/v1/announcements)
   */
  loadAnnouncements(): Observable<any> {
    const announcementsUrl = `${environment.apiUrl}/announcements`;
    const changelogUrl = `${environment.apiUrl}/announcements/changelog`;

    return forkJoin({
      announcements: this.http.get<any>(announcementsUrl).pipe(catchError(() => of(null))),
      changelog: this.http.get<any>(changelogUrl).pipe(catchError(() => of(null))),
    }).pipe(
      map((res) => {
        if (res.announcements?.data && Array.isArray(res.announcements.data) && res.announcements.data.length > 0) {
          const mapped: SystemAnnouncement[] = res.announcements.data.map((a: any) => ({
            id: a.id,
            tipo: a.tipo || 'COMUNICADO_OPERATIVO',
            titulo: a.titulo,
            mensaje: a.mensaje,
            afectaServicio: a.afectaServicio || false,
            publicadoPorNombre: a.publicadoPorNombre || 'Administrador',
            publicadoPorRol: a.publicadoPorRol || 'ADMIN',
            inicioEvento: a.inicioEvento,
            finEstimado: a.finEstimado,
            createdAt: a.createdAt || new Date().toISOString(),
          }));
          this.saveAnnouncements(mapped);
          this.announcementsSignal.set(mapped);
        }

        if (res.changelog?.data && Array.isArray(res.changelog.data) && res.changelog.data.length > 0) {
          const mappedChangelog: ChangelogRelease[] = res.changelog.data.map((c: any) => ({
            id: c.id,
            versionTag: c.versionTag,
            titulo: c.titulo,
            tipoRelease: c.tipoRelease || 'MINOR',
            resumen: c.resumen || '',
            detalles: c.detalles || [],
            redactadoPorNombre: c.redactadoPorNombre || 'Aldair (Tech Lead)',
            fechaLanzamiento: c.fechaLanzamiento || '2026-03-15',
            createdAt: c.createdAt || new Date().toISOString(),
          }));
          this.saveChangelogs(mappedChangelog);
          this.changelogsSignal.set(mappedChangelog);
        }

        return { announcements: this.announcementsSignal(), changelog: this.changelogsSignal() };
      })
    );
  }

  /**
   * Publica un nuevo comunicado oficial (POST /api/v1/announcements)
   */
  addAnnouncement(
    dto: CreateAnnouncementDto,
    authorName: string,
    authorRole: string
  ): SystemAnnouncement {
    const url = `${environment.apiUrl}/announcements`;

    const payload = {
      tipoId: dto.tipo === 'CAIDA_SERVICIO' ? 1 : dto.tipo === 'MANTENIMIENTO_PROGRAMADO' ? 2 : 3,
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      afectaServicio: dto.afectaServicio,
      inicioEvento: dto.inicioEvento,
      finEstimado: dto.finEstimado,
    };

    this.http.post<any>(url, payload).pipe(
      catchError(() => of(null))
    ).subscribe();

    const nextId =
      Math.max(...this.announcementsSignal().map((a) => a.id), 0) + 1;
    const newAnnouncement: SystemAnnouncement = {
      id: nextId,
      tipo: dto.tipo,
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      afectaServicio: dto.afectaServicio,
      publicadoPorNombre: authorName,
      publicadoPorRol: authorRole,
      inicioEvento: dto.inicioEvento,
      finEstimado: dto.finEstimado,
      createdAt: new Date().toISOString(),
    };

    const updated = [newAnnouncement, ...this.announcementsSignal()];
    this.saveAnnouncements(updated);
    this.announcementsSignal.set(updated);
    return newAnnouncement;
  }

  private getStoredAnnouncements(): SystemAnnouncement[] {
    try {
      const data = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
      return data ? JSON.parse(data) : DEMO_ANNOUNCEMENTS;
    } catch {
      return DEMO_ANNOUNCEMENTS;
    }
  }

  private saveAnnouncements(items: SystemAnnouncement[]): void {
    try {
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  private getStoredChangelogs(): ChangelogRelease[] {
    try {
      const data = localStorage.getItem(CHANGELOG_STORAGE_KEY);
      return data ? JSON.parse(data) : DEMO_CHANGELOGS;
    } catch {
      return DEMO_CHANGELOGS;
    }
  }

  private saveChangelogs(items: ChangelogRelease[]): void {
    try {
      localStorage.setItem(CHANGELOG_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }
}
