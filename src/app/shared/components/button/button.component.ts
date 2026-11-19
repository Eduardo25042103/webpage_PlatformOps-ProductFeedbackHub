import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="btnClick.emit($event)"
      class="inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-canvas disabled:opacity-50 disabled:cursor-not-allowed select-none"
      [ngClass]="[
        sizeClasses(),
        variantClasses(),
        fullWidth() ? 'w-full' : ''
      ]"
    >
      @if (loading()) {
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'outline' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);

  btnClick = output<MouseEvent>();

  sizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'lg':
        return 'px-5 py-3 text-base';
      case 'md':
      default:
        return 'px-4 py-2 text-sm';
    }
  });

  variantClasses = computed(() => {
    switch (this.variant()) {
      case 'secondary':
        return 'bg-surface-card hover:bg-surface-hover text-opsText-primary border border-surface-border';
      case 'outline':
        return 'bg-transparent text-primary hover:bg-primary-light border border-primary';
      case 'danger':
        return 'bg-p1-light hover:bg-red-900/30 text-p1 border border-p1-border';
      case 'primary':
      default:
        return 'bg-primary hover:bg-primary-hover text-white shadow-sm';
    }
  });
}
