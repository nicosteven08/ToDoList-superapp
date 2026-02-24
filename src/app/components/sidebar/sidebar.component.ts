import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../services/board.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-slate-50 border-r border-slate-100 h-[calc(100vh-64px)] overflow-y-auto hidden md:block">
      <div class="p-5">
        <div class="flex items-center justify-between mb-6 px-1">
          <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mis Tableros</h2>
          <button 
            (click)="createNewBoard()"
            class="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-500 transition-all duration-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>

        <nav class="space-y-1.5">
          @for (board of boardService.boards(); track board.id) {
            <a 
              [routerLink]="['/board', board.id]"
              routerLinkActive="bg-white shadow-sm border-slate-200 text-slate-700"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent rounded-xl transition-all group">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
              <span class="flex-1 truncate">{{ board.name }}</span>
            </a>
          }

          @if (boardService.boards().length === 0) {
            <p class="text-[10px] text-slate-400 text-center py-4 italic">No hay tableros</p>
          }
        </nav>

        <div class="mt-12">
          <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">Herramientas</h2>
          <nav class="space-y-1">
            <a routerLink="/dashboard" routerLinkActive="bg-white shadow-sm" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Estadísticas
            </a>
            <a href="#" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              Equipo
            </a>
            <a href="#" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Configuración
            </a>
          </nav>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  boardService = inject(BoardService);
  router = inject(Router);

  ngOnInit() {
    this.boardService.getBoards();
  }

  async createNewBoard() {
    const name = prompt('Nombre del nuevo proyecto:');
    if (name && name.trim()) {
      try {
        const board = await this.boardService.createBoard(name.trim());
        this.router.navigate(['/board', board.id]);
      } catch (error) {
        console.error('Error creating board:', error);
        alert('Error al crear el tablero');
      }
    }
  }
}
