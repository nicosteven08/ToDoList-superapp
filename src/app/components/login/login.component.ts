import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-xl p-10 relative overflow-hidden">
        <!-- Accent decorative element -->
        <div class="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
        
        <div class="text-center mb-10">
          <img src="America.png" alt="Logo" class="h-20 w-auto mx-auto mb-6 object-contain">
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Super <span class="text-red-600">Kanban</span></h1>
          <p class="text-slate-400 mt-2 font-medium">Ingresa a tu cuenta para continuar</p>
        </div>

        <form (submit)="onSubmit()" class="space-y-6">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="tu@email.com"
              class="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all outline-none bg-slate-50/50"
              required
            >
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              placeholder="••••••••"
              class="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all outline-none bg-slate-50/50"
              required
            >
          </div>

          <p *ngIf="error" class="text-red-600 text-xs text-center font-bold bg-red-50 py-2 rounded-lg">{{ error }}</p>

          <button 
            type="submit" 
            [disabled]="loading"
            class="w-full bg-slate-900 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all transform active:scale-[0.98] disabled:opacity-70"
          >
            <span *ngIf="!loading">{{ isRegister ? 'Crear Cuenta' : 'Iniciar Sesión' }}</span>
            <span *ngIf="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </span>
          </button>
        </form>

        <div class="mt-10 text-center">
          <p class="text-sm text-slate-500 font-medium">
            {{ isRegister ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?' }}
            <button (click)="isRegister = !isRegister" class="text-red-600 font-bold hover:underline ml-1">
              {{ isRegister ? 'Inicia sesión' : 'Regístrate aquí' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  loading = false;
  error = '';
  isRegister = false;

  async onSubmit() {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    
    try {
      if (this.isRegister) {
        await this.authService.signUp(this.email, this.password);
        alert('Registro exitoso. Revisa tu email para confirmar.');
        this.loading = false;
        this.cdr.detectChanges();
      } else {
        await this.authService.signIn(this.email, this.password);
        // No reseteamos loading aquí porque vamos a navegar
        this.router.navigate(['/dashboard']);
      }
    } catch (e: any) {
      this.error = e.message || 'Error en la autenticación';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}


