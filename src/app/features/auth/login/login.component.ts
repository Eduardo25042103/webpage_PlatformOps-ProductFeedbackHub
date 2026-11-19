import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InputTextComponent } from '../../../shared/components/input/input-text.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { DEMO_USERS } from '../../../core/services/demo-users.data';
import {
  LucideUserCheck,
  LucideTriangleAlert,
  LucideArrowRight,
  LucideChevronDown,
  LucideChevronUp,
} from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextComponent,
    ButtonComponent,
    CardComponent,
    LucideUserCheck,
    LucideTriangleAlert,
    LucideArrowRight,
    LucideChevronDown,
    LucideChevronUp,
  ],
  template: `
    <app-card [padding]="true" class="shadow-2xl shadow-black/40">
      <!-- Card Title & Subtitle -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-white tracking-tight">
          Iniciar Sesión
        </h2>
        <p class="text-xs text-opsText-muted mt-1">
          Ingresa a tu cuenta para continuar.
        </p>
      </div>

      <!-- Navigation Tabs: Iniciar Sesión / Registrarse -->
      <div class="grid grid-cols-2 gap-1 p-1 mb-5 bg-canvas rounded-lg border border-surface-border text-xs">
        <span class="py-1.5 text-center font-semibold text-white bg-surface-card rounded shadow-sm border border-surface-border">
          Iniciar Sesión
        </span>
        <a
          routerLink="/register"
          class="py-1.5 text-center font-medium text-opsText-muted hover:text-white rounded transition-colors"
        >
          Crear Cuenta
        </a>
      </div>

      <!-- Error Message Banner -->
      @if (errorMessage()) {
        <div class="mb-4 p-3 rounded-md bg-p1-light border border-p1-border flex items-start gap-2.5 animate-fadeIn">
          <svg lucideTriangleAlert class="w-4 h-4 text-p1 shrink-0 mt-0.5"></svg>
          <div class="text-xs text-p1 font-medium leading-relaxed">
            {{ errorMessage() }}
          </div>
        </div>
      }

      <!-- Form Inputs -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <app-input-text
            formControlName="email"
            label="Correo Electrónico"
            placeholder="usuario@tunegocio.pe"
            [error]="emailError()"
          ></app-input-text>
        </div>

        <div>
          <app-input-text
            formControlName="password"
            label="Contraseña"
            placeholder="••••••••"
            [isPassword]="true"
            [error]="passwordError()"
          ></app-input-text>
        </div>

        <div class="flex items-center justify-between text-xs pt-1">
          <label class="flex items-center gap-2 text-opsText-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              formControlName="recordar"
              class="rounded bg-canvas border-surface-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Recordar sesión</span>
          </label>

          <a href="#" (click)="$event.preventDefault()" class="text-primary hover:text-primary-focus transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <div class="pt-2">
          <app-button
            type="submit"
            variant="primary"
            [fullWidth]="true"
            [loading]="isLoading()"
          >
            <span>Iniciar Sesión</span>
          </app-button>
        </div>
      </form>

      <!-- Register Prompt Link -->
      <div class="mt-4 pt-3 border-t border-surface-border text-center text-xs text-opsText-secondary">
        <span>¿No tienes una cuenta?</span>
        <a
          routerLink="/register"
          class="ml-1.5 text-primary hover:text-primary-focus font-semibold transition-colors inline-flex items-center gap-1"
        >
          <span>Regístrate aquí</span>
          <svg lucideArrowRight class="w-3 h-3"></svg>
        </a>
      </div>

      <!-- COLLAPSIBLE DEMO ACCOUNTS SELECTION -->
      <div class="mt-4 pt-3 border-t border-surface-border">
        <button
          type="button"
          (click)="toggleDemoAccounts()"
          class="w-full flex items-center justify-between text-xs text-opsText-muted hover:text-white transition-colors py-1 focus:outline-none cursor-pointer"
        >
          <span class="flex items-center gap-1.5 font-medium">
            <svg lucideUserCheck class="w-3.5 h-3.5 text-accentCyan"></svg>
            <span>Cuentas de prueba (Demo)</span>
          </span>
          <span class="text-[11px] text-primary flex items-center gap-1 font-medium">
            {{ showDemoAccounts() ? 'Ocultar' : 'Mostrar' }}
            @if (showDemoAccounts()) {
              <svg lucideChevronUp class="w-3.5 h-3.5"></svg>
            } @else {
              <svg lucideChevronDown class="w-3.5 h-3.5"></svg>
            }
          </span>
        </button>

        @if (showDemoAccounts()) {
          <div class="mt-3 space-y-2 animate-fadeIn">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                (click)="selectDemo('dev')"
                class="flex items-center gap-2 p-2 rounded border border-surface-border bg-canvas hover:bg-surface-hover hover:border-primary transition-all text-left"
              >
                <span class="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                  A
                </span>
                <div class="truncate">
                  <div class="font-semibold text-white text-[11px] truncate">Aldair</div>
                  <div class="text-[9px] font-mono text-opsText-muted truncate">TI / Desarrollo</div>
                </div>
              </button>

              <button
                type="button"
                (click)="selectDemo('soporte')"
                class="flex items-center gap-2 p-2 rounded border border-surface-border bg-canvas hover:bg-surface-hover hover:border-accentCyan transition-all text-left"
              >
                <span class="w-6 h-6 rounded-full bg-accentCyan/20 text-accentCyan font-bold text-[11px] flex items-center justify-center shrink-0">
                  H
                </span>
                <div class="truncate">
                  <div class="font-semibold text-white text-[11px] truncate">Henry</div>
                  <div class="text-[9px] font-mono text-opsText-muted truncate">Soporte Técnico</div>
                </div>
              </button>

              <button
                type="button"
                (click)="selectDemo('ventas')"
                class="flex items-center gap-2 p-2 rounded border border-surface-border bg-canvas hover:bg-surface-hover hover:border-secondary transition-all text-left"
              >
                <span class="w-6 h-6 rounded-full bg-secondary/20 text-secondary font-bold text-[11px] flex items-center justify-center shrink-0">
                  J
                </span>
                <div class="truncate">
                  <div class="font-semibold text-white text-[11px] truncate">Josue</div>
                  <div class="text-[9px] font-mono text-opsText-muted truncate">Ventas</div>
                </div>
              </button>

              <button
                type="button"
                (click)="selectDemo('marketing')"
                class="flex items-center gap-2 p-2 rounded border border-surface-border bg-canvas hover:bg-surface-hover hover:border-success transition-all text-left"
              >
                <span class="w-6 h-6 rounded-full bg-success/20 text-success font-bold text-[11px] flex items-center justify-center shrink-0">
                  E
                </span>
                <div class="truncate">
                  <div class="font-semibold text-white text-[11px] truncate">Eduardo</div>
                  <div class="text-[9px] font-mono text-opsText-muted truncate">Marketing</div>
                </div>
              </button>
            </div>

            <button
              type="button"
              (click)="selectDemo('admin')"
              class="w-full py-1.5 px-3 rounded border border-surface-border bg-canvas hover:bg-surface-hover hover:border-p2 transition-all flex items-center justify-center gap-2 text-[11px] font-medium text-opsText-secondary hover:text-white"
            >
              <span class="w-2 h-2 rounded-full bg-p2"></span>
              <span>Acceder como Administrador</span>
            </button>
          </div>
        }
      </div>
    </app-card>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    email: ['aldair.cahuana@tunegocio.pe', [Validators.required, Validators.email]],
    password: ['Password123!', [Validators.required, Validators.minLength(6)]],
    recordar: [true],
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showDemoAccounts = signal<boolean>(false);

  toggleDemoAccounts(): void {
    this.showDemoAccounts.update((prev) => !prev);
  }

  emailError(): string | null {
    const control = this.loginForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El correo electrónico es obligatorio';
      if (control.errors['email']) return 'Formato de correo inválido';
    }
    return null;
  }

  passwordError(): string | null {
    const control = this.loginForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'La contraseña es obligatoria';
      if (control.errors['minlength']) return 'Mínimo 6 caracteres';
    }
    return null;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password, recordar } = this.loginForm.value;

    this.authService.login({ email, password, recordar }).subscribe({
      next: () => {
        this.isLoading.set(false);
        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.message || 'No fue posible iniciar sesión. Verifica tus credenciales.'
        );
      },
    });
  }

  selectDemo(roleKey: 'dev' | 'soporte' | 'ventas' | 'marketing' | 'admin'): void {
    const demo = DEMO_USERS[roleKey];
    if (demo) {
      this.loginForm.patchValue({
        email: demo.email,
        password: 'Password123!',
      });
      // Iniciar sesión real con las credenciales cargadas
      this.onSubmit();
    }
  }
}
