import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LucideSparkles } from '@lucide/angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LucideSparkles],
  template: `
    <div class="min-h-screen bg-canvas flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Top Branding Header -->
      <div class="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
            <svg lucideSparkles class="w-5 h-5 text-white"></svg>
          </div>
          <div>
            <div class="text-base font-bold tracking-tight text-white">
              TuNegocio.pe
            </div>
            <div class="text-xs font-mono font-medium text-opsText-muted">
              PlatformOps & Feedback Hub
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary-light text-primary border border-primary-border">
            v1.0
          </span>
        </div>
      </div>

      <!-- Center Auth Content (Login Form) -->
      <main class="w-full max-w-md mx-auto my-auto py-8 z-10">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Footer -->
      <footer class="w-full max-w-6xl mx-auto text-center text-xs text-opsText-muted py-4 border-t border-surface-border/40 z-10">
        <p>
          TuNegocio.pe &bull; Sistema de Portal Integrado de Soporte y Solicitudes Internas &bull; IDAT 2026
        </p>
      </footer>
    </div>
  `,
})
export class AuthLayoutComponent {}
