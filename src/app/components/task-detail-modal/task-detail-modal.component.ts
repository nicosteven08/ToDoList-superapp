import { Component, Inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { TaskService } from '../../services/task.service';
import { Task, Comment, Tag, Priority } from '../../models/board.model';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col font-sans">
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex justify-between items-start">
        <div class="flex-1 mr-4">
          <input 
            [(ngModel)]="task.title" 
            (blur)="updateTask()"
            class="text-2xl font-bold text-gray-800 w-full border-none focus:ring-2 focus:ring-indigo-500 rounded px-2 -ml-2"
            placeholder="Título de la tarea"
          />
          <p class="text-sm text-gray-400 mt-1">en columna <span class="font-medium text-gray-600">{{data.columnName}}</span></p>
        </div>
        <button (click)="close()" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Left Column: Description & Comments -->
          <div class="md:col-span-2 space-y-8">
            <!-- Description -->
            <div>
              <div class="flex items-center space-x-2 text-gray-700 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h6v2H7V5zm6 4H7v2h6V9zm-6 4h3v2H7v-2z" clip-rule="evenodd" />
                </svg>
                <h3 class="font-semibold text-lg">Descripción</h3>
              </div>
              <textarea 
                [(ngModel)]="task.description" 
                (blur)="updateTask()"
                class="w-full min-h-[120px] p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
                placeholder="Añade una descripción más detallada..."
              ></textarea>
            </div>

            <!-- Tags -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2 text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                  </svg>
                  <h3 class="font-semibold text-lg">Etiquetas</h3>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mb-4">
                <div *ngFor="let tag of taskTags()" 
                     [style.backgroundColor]="tag.color"
                     class="px-3 py-1 rounded-full text-white text-xs font-medium flex items-center group">
                  {{tag.name}}
                  <button (click)="removeTag(tag)" class="ml-2 hover:scale-120 transition-transform hidden group-hover:block">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button (click)="showTagMenu = !showTagMenu" class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium transition-colors">
                  + Añadir etiqueta
                </button>
              </div>

              <!-- Tag Selector -->
              <div *ngIf="showTagMenu" class="absolute z-10 bg-white border border-gray-100 shadow-xl rounded-lg p-3 w-64 mt-[-10px]">
                <div class="mb-3">
                  <input [(ngModel)]="newTagName" placeholder="Nueva etiqueta..." class="w-full text-xs border border-gray-200 rounded p-2 mb-2">
                  <div class="flex gap-1 mb-2">
                    <button *ngFor="let c of tagColors" (click)="selectedColor = c" 
                            [style.backgroundColor]="c"
                            [class.ring-2]="selectedColor === c"
                            class="w-5 h-5 rounded-full ring-offset-1 ring-indigo-500"></button>
                  </div>
                  <button (click)="createNewTag()" class="w-full bg-indigo-600 text-white text-xs py-2 rounded">Crear y añadir</button>
                </div>
                <div class="border-t pt-2 max-h-40 overflow-y-auto">
                    <p class="text-[10px] uppercase text-gray-400 font-bold mb-2">Existentes</p>
                    <button *ngFor="let tag of availableTags()" 
                            (click)="addTag(tag)"
                            class="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex items-center justify-between group">
                        <span [style.backgroundColor]="tag.color" class="w-2 h-2 rounded-full mr-2"></span>
                        <span class="flex-1">{{tag.name}}</span>
                    </button>
                </div>
              </div>
            </div>

            <!-- Comments -->
            <div>
              <div class="flex items-center space-x-2 text-gray-700 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                </svg>
                <h3 class="font-semibold text-lg">Actividad</h3>
              </div>

              <div class="flex space-x-4 mb-8">
                <div class="h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                  {{getCurrentUserInitials()}}
                </div>
                <div class="flex-1">
                  <div class="relative">
                    <textarea 
                      [(ngModel)]="newCommentText"
                      placeholder="Escribe un comentario..."
                      class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none shadow-sm"
                    ></textarea>
                    <div class="flex justify-end mt-2">
                       <button 
                        (click)="saveComment()"
                        [disabled]="!newCommentText.trim()"
                        class="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Comentar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div *ngFor="let comment of comments()" class="flex space-x-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0 border border-slate-200">
                    {{getInitials('U')}}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <span class="font-bold text-xs uppercase tracking-wider text-slate-400">Usuario</span>
                      <span class="text-[10px] text-slate-300 font-medium">{{formatDate(comment.created_at)}}</span>
                    </div>
                    <div class="bg-white p-3 rounded-xl text-sm text-slate-600 inline-block border border-slate-100 shadow-sm">
                      {{comment.content}}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Settings -->
          <div class="space-y-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100 h-fit">

            <div>
              <label class="block text-[10px] uppercase font-bold text-gray-400 mb-2">Prioridad</label>
              <div class="flex flex-col space-y-1">
                <button 
                  *ngFor="let p of priorities"
                  (click)="setPriority(p)"
                  [class.ring-2]="task.priority === p.id"
                  [class.ring-offset-1]="task.priority === p.id"
                  [style.borderColor]="task.priority === p.id ? p.color : ''"
                  class="flex items-center p-2 text-xs rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all font-medium"
                >
                  <span [style.backgroundColor]="p.color" class="w-3 h-3 rounded-full mr-2"></span>
                  {{p.label}}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-[10px] uppercase font-bold text-gray-400 mb-2">Fecha de vencimiento</label>
              <input 
                type="date" 
                [(ngModel)]="dueDateStr"
                (change)="updateDueDate()"
                class="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div class="pt-4 border-t border-gray-200">
                <button (click)="close()" class="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                    Marcar como completada
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    /* Hide native focus styling if needed but kept ring for accessibility */
    input:focus, textarea:focus, select:focus {
      outline: none;
    }
  `]
})
export class TaskDetailModalComponent implements OnInit, OnDestroy {
  task: Task;
  comments = signal<Comment[]>([]);
  taskTags = signal<Tag[]>([]);
  availableTags = signal<Tag[]>([]);
  private commentChannel: any;

  newCommentText = '';
  showTagMenu = false;
  newTagName = '';
  selectedColor = '#3b82f6';
  dueDateStr = '';

  tagColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  priorities: {id: Priority, label: string, color: string}[] = [
    { id: 'low', label: 'Baja', color: '#10b981' },
    { id: 'medium', label: 'Media', color: '#f59e0b' },
    { id: 'high', label: 'Alta', color: '#ef4444' }
  ];

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: { task: Task, boardId: string, columnName: string },
    private taskService: TaskService
  ) {
    this.task = { ...data.task };
    if (this.task.due_date) {
      this.dueDateStr = new Date(this.task.due_date).toISOString().split('T')[0];
    }
  }

  async ngOnInit() {
    this.loadComments();
    this.loadTags();
    this.setupCommentSubscription();
  }

  ngOnDestroy() {
    if (this.commentChannel) {
      this.commentChannel.unsubscribe();
    }
  }

  setupCommentSubscription() {
    this.commentChannel = this.taskService.subscribeToComments(this.task.id, () => {
      this.loadComments();
    });
  }

  async loadComments() {
    const comments = await this.taskService.getComments(this.task.id);
    this.comments.set(comments);
  }

  async loadTags() {
    const [tTags, bTags] = await Promise.all([
      this.taskService.getTaskTags(this.task.id),
      this.taskService.getBoardTags(this.data.boardId)
    ]);
    this.taskTags.set(tTags);
    this.availableTags.set(bTags.filter(bt => !tTags.some(tt => tt.id === bt.id)));
  }


  async updateTask() {
    try {
      await this.taskService.updateTask(this.task.id, {
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        assignee_id: this.task.assignee_id,
        due_date: this.task.due_date
      });
      // Optionally notify board component about the update or use a signal-based shared state
    } catch (e) {
      console.error('Error updating task', e);
    }
  }

  updateDueDate() {
    this.task.due_date = this.dueDateStr ? new Date(this.dueDateStr).toISOString() : null;
    this.updateTask();
  }

  setPriority(p: {id: Priority}) {
    this.task.priority = p.id;
    this.updateTask();
  }

  async saveComment() {
    if (!this.newCommentText.trim()) return;
    try {
      const comment = await this.taskService.addComment(this.task.id, this.newCommentText);
      this.comments.update(prev => [...prev, comment]);
      this.newCommentText = '';
    } catch (e) {
      console.error('Error saving comment', e);
    }
  }

  async addTag(tag: Tag) {
    try {
      await this.taskService.addTaskTag(this.task.id, tag.id);
      this.taskTags.update(prev => [...prev, tag]);
      this.availableTags.update(prev => prev.filter(t => t.id !== tag.id));
      this.showTagMenu = false;
    } catch (e) {
      console.error('Error adding tag', e);
    }
  }

  async removeTag(tag: Tag) {
    try {
      await this.taskService.removeTaskTag(this.task.id, tag.id);
      this.taskTags.update(prev => prev.filter(t => t.id !== tag.id));
      this.availableTags.update(prev => [...prev, tag]);
    } catch (e) {
      console.error('Error removing tag', e);
    }
  }

  async createNewTag() {
    if (!this.newTagName.trim()) return;
    try {
      const tag = await this.taskService.createTag(this.data.boardId, this.newTagName, this.selectedColor);
      await this.addTag(tag);
      this.newTagName = '';
    } catch (e) {
      console.error('Error creating tag', e);
    }
  }

  getInitials(email: string) {
    return email.substring(0, 2).toUpperCase();
  }

  getCurrentUserInitials() {
    // This could be fetched from AuthService, but for now 'YO'
    return 'ME';
  }

  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  close() {
    this.dialogRef.close(this.task);
  }
}
