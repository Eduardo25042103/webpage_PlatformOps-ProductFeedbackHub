import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketPriority } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-priority-badge',
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
        [ngClass]="badgeConfig().dotClass"
      ></span>
      {{ badgeConfig().label }}
    </span>
  `,
})
export class PriorityBadgeComponent {
  priority = input.required<TicketPriority>();
  size = input<'sm' | 'md'>('md');

  badgeConfig = computed(() => {
    switch (this.priority()) {
      case 'P1':
        return {
          label: 'P1 CRÍTICO',
          bgClass: 'bg-p1-light',
          borderClass: 'border-p1-border',
          textClass: 'text-p1',
          dotClass: 'bg-p1',
        };
      case 'P2':
        return {
          label: 'P2 ALTA',
          bgClass: 'bg-p2-light',
          borderClass: 'border-p2-border',
          textClass: 'text-p2',
          dotClass: 'bg-p2',
        };
      case 'P3':
        return {
          label: 'P3 MEDIA',
          bgClass: 'bg-p3-light',
          borderClass: 'border-p3-border',
          textClass: 'text-p3',
          dotClass: 'bg-p3',
        };
      case 'P4':
      default:
        return {
          label: 'P4 BAJA',
          bgClass: 'bg-p4-light',
          borderClass: 'border-p4-border',
          textClass: 'text-p4',
          dotClass: 'bg-p4',
        };
    }
  });
}
