import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from '../../services/board.service';
import { TaskService } from '../../services/task.service';
import { Board, BoardColumn, Task } from '../../models/board.model';
import { FormsModule } from '@angular/forms';
import { 
  DragDropModule, 
  CdkDragDrop, 
  moveItemInArray, 
  transferArrayItem 
} from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { TaskDetailModalComponent } from '../task-detail-modal/task-detail-modal.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit, OnDestroy {
  board = signal<Board | null>(null);
  columns = signal<BoardColumn[]>([]);
  tasks = signal<Task[]>([]);
  isLoading = signal(true);
  newColumnName = '';
  isAddingColumn = signal(false);

  // Group tasks by column for easier D&D handling
  tasksByColumn = computed(() => {
    const grouped: { [key: string]: Task[] } = {};
    this.columns().forEach(col => {
      grouped[col.id] = this.tasks()
        .filter(t => t.column_id === col.id)
        .sort((a, b) => a.position - b.position);
    });
    return grouped;
  });

  boardService = inject(BoardService);
  taskService = inject(TaskService);
  private dialog = inject(Dialog);
  private route = inject(ActivatedRoute);

  constructor() {}

  async addTask(columnId: string) {
    const title = prompt('Título de la nueva tarea:');
    if (title && title.trim()) {
      try {
        const nextPosition = (this.tasksByColumn()[columnId] || []).length + 1;
        const newTask = await this.taskService.createTask(columnId, title.trim(), nextPosition);
        this.tasks.update(t => [...t, newTask]);
      } catch (error) {
        console.error('Error adding task:', error);
        alert('Error al crear la tarea');
      }
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadBoardData(id);
      }
    });
  }

  ngOnDestroy() {
    if (this.board()) {
      this.boardService.unsubscribeFromBoard(this.board()!.id);
    }
  }

  async loadBoardData(id: string) {
    try {
      this.isLoading.set(true);
      const [boardData, columnsData, tasksData] = await Promise.all([
        this.boardService.getBoard(id),
        this.boardService.getColumns(id),
        this.boardService.getTasks(id)
      ]);
      this.board.set(boardData);
      this.columns.set(columnsData.sort((a, b) => a.position - b.position));
      this.tasks.set(tasksData);

      // Subscribe to real-time updates
      this.boardService.subscribeToBoardChanges(id, () => {
        this.loadBoardData(id);
      });
    } catch (error) {
      console.error('Error loading board data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async drop(event: CdkDragDrop<Task[]>, columnId: string) {
    if (event.previousContainer === event.container) {
      // Move within same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateTasksPositions(event.container.data, columnId);
    } else {
      // Move to different column
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updateTasksPositions(event.container.data, columnId);
      // Also update positions in the previous column if needed, 
      // but usually the DB just needs the target one updated if positions are relative.
      // For simplicity, we'll update the target task's column_id immediately.
      const task = event.container.data[event.currentIndex];
      await this.boardService.updateTask(task.id, { 
        column_id: columnId,
        position: event.currentIndex + 1
      });
    }
    
    // Refresh signal state to keep everything in sync
    // In a real app, we might do this more granularly
  }

  private async updateTasksPositions(tasks: Task[], columnId: string) {
    // Update positions locally first for smooth UI (already done by moveItemInArray/transferArrayItem)
    // Update positions in DB
    const updates = tasks.map((task, index) => 
      this.boardService.updateTask(task.id, { 
        position: index + 1,
        column_id: columnId 
      })
    );
    await Promise.all(updates);
  }

  async addColumn() {
    if (!this.newColumnName.trim() || !this.board()) return;

    try {
      const nextPosition = this.columns().length > 0 
        ? Math.max(...this.columns().map(c => c.position)) + 1 
        : 1;
      
      const newCol = await this.boardService.addColumn(
        this.board()!.id, 
        this.newColumnName.trim(), 
        nextPosition
      );
      
      this.columns.update(cols => [...cols, newCol]);
      this.newColumnName = '';
      this.isAddingColumn.set(false);
    } catch (error) {
      console.error('Error adding column:', error);
    }
  }

  toggleAddColumn() {
    this.isAddingColumn.update(v => !v);
    if (!this.isAddingColumn()) {
      this.newColumnName = '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  openTaskModal(task: Task, column: BoardColumn) {
    const dialogRef = this.dialog.open(TaskDetailModalComponent, {
      data: {
        task,
        boardId: this.board()?.id,
        columnName: column.name
      },
      disableClose: false
    });

    dialogRef.closed.subscribe(result => {
      if (result) {
        // Refresh board data to show updates if they happened in the modal
        this.loadBoardData(this.board()!.id);
      }
    });
  }
}

