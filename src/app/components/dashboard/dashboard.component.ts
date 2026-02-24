import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../services/board.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight">Bienvenido al Dashboard</h1>
          <p class="text-slate-400 font-medium">Resumen general de tus proyectos y tareas pendientes.</p>
        </div>
        <div class="flex items-center gap-3">
           <button class="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">Exportar Datos</button>
           <button 
            (click)="createNewBoard()"
            class="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            + Nuevo Proyecto
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer" (click)="boardService.getBoards()">
          <div class="flex items-center justify-between mb-6">
             <div class="bg-red-50 p-3 rounded-2xl group-hover:bg-red-600 transition-colors duration-300">
               <svg class="w-6 h-6 text-red-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
               </svg>
             </div>
             <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tableros</span>
          </div>
          <p class="text-5xl font-black text-slate-800 tracking-tighter mb-1">{{ boardService.boards().length | number:'2.0' }}</p>
          <h3 class="font-bold text-slate-400 text-sm uppercase tracking-wide">Tableros Activos</h3>
        </div>

        <div class="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div class="flex items-center justify-between mb-6">
             <div class="bg-slate-50 p-3 rounded-2xl group-hover:bg-slate-900 transition-colors duration-300">
               <svg class="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
               </svg>
             </div>
             <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global</span>
          </div>
          <p class="text-5xl font-black text-slate-800 tracking-tighter mb-1">00</p>
          <h3 class="font-bold text-slate-400 text-sm uppercase tracking-wide">Tareas Completadas</h3>
        </div>

        <div class="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div class="flex items-center justify-between mb-6">
             <div class="bg-red-50 p-3 rounded-2xl group-hover:bg-red-600 transition-colors duration-300">
               <svg class="w-6 h-6 text-red-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>
             </div>
             <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Urgente</span>
          </div>
          <p class="text-5xl font-black text-red-600 tracking-tighter mb-1">00</p>
          <h3 class="font-bold text-slate-400 text-sm uppercase tracking-wide">Para esta semana</h3>
        </div>
      </div>

      <!-- Boards List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (board of boardService.boards(); track board.id) {
          <div 
            (click)="navigateToBoard(board.id)"
            class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <h4 class="font-bold text-slate-800 group-hover:text-red-600 transition-colors">{{ board.name }}</h4>
            <p class="text-xs text-slate-400 mt-2">Creado el {{ board.created_at | date:'mediumDate' }}</p>
          </div>
        }
      </div>

      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <h3 class="font-black text-slate-800 text-lg tracking-tight uppercase">Actividad Reciente</h3>
           <button class="text-xs text-red-600 font-black hover:underline uppercase tracking-widest">Ver Historial Completo</button>
        </div>
        <div class="p-4 text-center py-12" *ngIf="boardService.boards().length === 0">
           <p class="text-slate-400 font-medium">No hay actividad aún. ¡Crea tu primer proyecto!</p>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
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
        this.navigateToBoard(board.id);
      } catch (error) {
        console.error('Error creating board:', error);
        alert('Error al crear el tablero');
      }
    }
  }

  navigateToBoard(id: string) {
    this.router.navigate(['/board', id]);
  }
}
