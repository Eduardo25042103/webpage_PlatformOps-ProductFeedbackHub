import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketStatus } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full border font-bold tracking-wider uppercase transition-colors"
      [ngClass]="[
        size() === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        badgeConfig().bgClass,
        badgeConfig().borderClass,
        badgeConfig().textClass
      ]"
    >
      <span
        class="h-1.5 w-1.5 rounded-full"
        [ngClass]="[
          badgeConfig().dotClass,
          badgeConfig().isLive ? 'animate-pulse-dot' : ''
        ]"
      ></span>
      {{ badgeConfig().label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  status = input.required<TicketStatus>();
  size = input<'sm' | 'md'>('md');

  badgeConfig = computed(() => {
    switch (this.status()) {
      case 'NUEVO':
        return {
          label: 'NUEVO',
          bgClass: 'bg-accentCyan-light',
          borderClass: 'border-accentCyan-border',
          textClass: 'text-accentCyan',
          dotClass: 'bg-accentCyan',
          isLive: false,
        };
      case 'EN_DIAGNOSTICO':
        return {
          label: 'EN DIAGNÓSTICO',
          bgClass: 'bg-secondary-light',
          borderClass: 'border-secondary-border',
          textClass: 'text-secondary',
          dotClass: 'bg-secondary',
          isLive: true,
        };
      case 'EN_DESARROLLO':
        return {
          label: 'EN DESARROLLO',
          bgClass: 'bg-primary-light',
          borderClass: 'border-primary-border',
          textClass: 'text-primary',
          dotClass: 'bg-primary',
          isLive: true,
        };
      case 'EN_QA':
        return {
          label: 'EN QA',
          bgClass: 'bg-p2-light',
          borderClass: 'border-p2-border',
          textClass: 'text-p2',
          dotClass: 'bg-p2',
          isLive: false,
        };
      case 'RESUELTO':
        return {
          label: 'RESUELTO',
          bgClass: 'bg-success-light',
          borderClass: 'border-success-border',
          textClass: 'text-success',
          dotClass: 'bg-success',
          isLive: false,
        };
      case 'CERRADO':
      default:
        return {
          label: 'CERRADO',
          bgClass: 'bg-surface-card',
          borderClass: 'border-surface-border',
          textClass: 'text-opsText-muted',
          dotClass: 'bg-opsText-muted',
          isLive: false,
        };
    }
  });
}
