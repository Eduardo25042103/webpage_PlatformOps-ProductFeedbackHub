import { Component, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideEye, LucideEyeOff],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      @if (label()) {
        <label class="block text-xs font-semibold text-opsText-muted uppercase tracking-wider mb-1.5">
          {{ label() }}
        </label>
      }
      <div
        class="relative flex items-center rounded-md bg-canvas border transition-all"
        [ngClass]="[
          error() ? 'border-p1 focus-within:ring-p1' : 'border-surface-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
          disabled() ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <input
          [type]="isPassword() && !showPassword() ? 'password' : 'text'"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [value]="value()"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
          class="w-full bg-transparent px-3.5 py-2.5 text-sm text-opsText-primary placeholder-opsText-muted focus:outline-none"
        />

        @if (isPassword()) {
          <button
            type="button"
            (click)="togglePasswordVisibility()"
            [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Ver contraseña'"
            class="px-3 text-opsText-muted hover:text-white transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
            tabindex="-1"
          >
            @if (showPassword()) {
              <svg lucideEyeOff class="w-4 h-4"></svg>
            } @else {
              <svg lucideEye class="w-4 h-4"></svg>
            }
          </button>
        }
      </div>

      @if (error()) {
        <p class="mt-1.5 text-xs text-p1 font-medium">{{ error() }}</p>
      }
    </div>
  `,
})
export class InputTextComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  error = input<string | null>(null);
  isPassword = input<boolean>(false);
  disabled = signal<boolean>(false);

  value = signal<string>('');
  showPassword = signal<boolean>(false);

  onChange = (val: string) => {};
  onTouched = () => {};

  writeValue(val: string): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((prev) => !prev);
  }
}
