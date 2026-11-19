import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogDepartmentDto } from '../../../core/models/auth.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input/input-text.component';
import {
  LucideBuilding2,
  LucideTriangleAlert,
  LucideArrowRight,
} from '@lucide/angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    InputTextComponent,
    LucideBuilding2,
    LucideTriangleAlert,
    LucideArrowRight,
  ],
  template: `
    <app-card [padding]="true" class="shadow-2xl shadow-black/40">
      <!-- Card Title & Subtitle -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-white tracking-tight">
          Crear Cuenta
        </h2>
        <p class="text-xs text-opsText-muted mt-1">
          Completa tus datos para registrarte en la plataforma.
        </p>
      </div>

      <!-- Navigation Tabs: Iniciar Sesión / Registrarse -->
      <div class="grid grid-cols-2 gap-1 p-1 mb-5 bg-canvas rounded-lg border border-surface-border text-xs">
        <a
          routerLink="/login"
          class="py-1.5 text-center font-medium text-opsText-muted hover:text-white rounded transition-colors"
        >
          Iniciar Sesión
        </a>
        <span class="py-1.5 text-center font-semibold text-white bg-surface-card rounded shadow-sm border border-surface-border">
          Crear Cuenta
        </span>
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
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-3.5">
        <!-- Nombres y Apellidos -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <app-input-text
              formControlName="nombre"
              label="Nombre"
              placeholder="Ej. Aldair"
              [error]="controlError('nombre')"
            ></app-input-text>
          </div>
          <div>
            <app-input-text
              formControlName="apellido"
              label="Apellido"
              placeholder="Ej. Cahuana"
              [error]="controlError('apellido')"
            ></app-input-text>
          </div>
        </div>

        <!-- Correo Electrónico -->
        <div>
          <app-input-text
            formControlName="email"
            label="Correo Electrónico"
            placeholder="colaborador@tunegocio.pe"
            [error]="controlError('email')"
          ></app-input-text>
        </div>

        <!-- Teléfono Directo -->
        <div>
          <app-input-text
            formControlName="telefono"
            label="Teléfono"
            placeholder="+51 987 654 321"
          ></app-input-text>
        </div>

        <!-- Departamento Organizacional -->
        <div>
          <label class="block text-xs font-semibold text-opsText-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <svg lucideBuilding2 class="w-3.5 h-3.5 text-primary"></svg>
            <span>Departamento</span>
          </label>
          <select
            formControlName="departamentoId"
            class="w-full px-3 py-2.5 bg-canvas border border-surface-border rounded-md text-sm text-opsText-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all cursor-pointer"
          >
            @for (d of departments(); track d.id) {
              <option [value]="d.id">{{ d.nombre }} ({{ d.codigo }})</option>
            }
          </select>
        </div>

        <!-- Contraseña -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <app-input-text
              formControlName="password"
              label="Contraseña"
              placeholder="••••••••"
              [isPassword]="true"
              [error]="controlError('password')"
            ></app-input-text>
          </div>
          <div>
            <app-input-text
              formControlName="confirmPassword"
              label="Confirmar"
              placeholder="••••••••"
              [isPassword]="true"
              [error]="passwordMismatchError()"
            ></app-input-text>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <app-button
            type="submit"
            variant="primary"
            [fullWidth]="true"
            [loading]="isLoading()"
          >
            <span>Crear Cuenta</span>
          </app-button>
        </div>
      </form>

      <!-- Footer switch to Login -->
      <div class="mt-4 pt-3 border-t border-surface-border text-center text-xs text-opsText-secondary">
        <span>¿Ya tienes una cuenta?</span>
        <a
          routerLink="/login"
          class="ml-1.5 text-primary hover:text-primary-focus font-semibold transition-colors inline-flex items-center gap-1"
        >
          <span>Inicia sesión aquí</span>
          <svg lucideArrowRight class="w-3 h-3"></svg>
        </a>
      </div>
    </app-card>
  `,
})
export class RegisterComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  departments = signal<CatalogDepartmentDto[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    departamentoId: [2, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.authService.getDepartmentsCatalog().subscribe({
      next: (data) => {
        this.departments.set(data);
        if (data.length > 0) {
          // Seleccionar por defecto TI & Desarrollo si existe
          const ti = data.find((d) => d.codigo === 'TI') || data[0];
          this.registerForm.patchValue({ departamentoId: ti.id });
        }
      },
    });
  }

  controlError(name: string): string | null {
    const control = this.registerForm.get(name);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['email']) return 'Formato de correo corporativo inválido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    return null;
  }

  passwordMismatchError(): string | null {
    const control = this.registerForm.get('confirmPassword');
    if (control?.touched) {
      if (control.errors?.['required']) return 'Confirma tu contraseña';
      const pwd = this.registerForm.get('password')?.value;
      if (pwd !== control.value) return 'Las contraseñas no coinciden';
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.errorMessage.set('Las contraseñas ingresadas no coinciden.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const val = this.registerForm.value;

    this.authService
      .register({
        nombre: val.nombre,
        apellido: val.apellido,
        email: val.email,
        telefono: val.telefono || undefined,
        departamentoId: Number(val.departamentoId),
        password: val.password,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Error al registrar el usuario en el backend.');
        },
      });
  }
}
