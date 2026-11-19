import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  host: {
    class: 'block w-full',
  },
  imports: [CommonModule],
  template: `
    <div
      class="rounded-xl bg-surface-card border border-surface-border transition-all"
      [ngClass]="[
        padding() ? 'p-4 sm:p-5' : '',
        hoverEffect() ? 'hover:border-slate-600 hover:shadow-lg hover:shadow-black/20' : ''
      ]"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  padding = input<boolean>(true);
  hoverEffect = input<boolean>(false);
}
