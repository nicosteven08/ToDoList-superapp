import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div class="flex items-center gap-3">
        <img src="America.png" alt="Logo" class="h-10 w-auto object-contain">
        <span class="text-xl font-extrabold tracking-tight text-slate-800">
          America de <span class="text-red-600">Cali</span>
        </span>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden md:flex flex-col items-end">
          <span class="text-sm font-semibold text-slate-700">{{ authService.currentUser()?.email }}</span>
          <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Administrador</span>
        </div>
        
        <div class="group relative">
          <button class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 hover:bg-slate-200 transition-all duration-200">
            <span class="text-slate-600 font-bold text-sm">{{ authService.currentUser()?.email?.[0]?.toUpperCase() }}</span>
          </button>
          
          <div class="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0">
             <div class="px-4 py-2 border-b border-slate-50 mb-1 md:hidden">
               <p class="text-xs text-slate-400 truncate">{{ authService.currentUser()?.email }}</p>
             </div>
             <button (click)="authService.signOut()" class="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
               </svg>
               <span class="font-medium">Cerrar sesión</span>
             </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
}
