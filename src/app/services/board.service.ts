import { Injectable, signal, WritableSignal } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Board, BoardColumn } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();

  public boards = signal<Board[]>([]);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getBoards() {
    const { data, error } = await this.supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    this.boards.set(data as Board[]);
    return data as Board[];
  }

  async getBoard(id: string) {
    const { data, error } = await this.supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Board;
  }

  async getColumns(boardId: string) {
    const { data, error } = await this.supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data as BoardColumn[];
  }

  async createBoard(name: string) {
    const { data, error } = await this.supabase
      .from('boards')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    
    // Refresh boards list
    await this.getBoards();
    
    return data as Board;
  }

  async addColumn(boardId: string, name: string, position: number) {
    const { data, error } = await this.supabase
      .from('columns')
      .insert({ board_id: boardId, name, position })
      .select()
      .single();

    if (error) throw error;
    return data as BoardColumn;
  }

  async updateColumn(id: string, updates: Partial<BoardColumn>) {
    const { data, error } = await this.supabase
      .from('columns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BoardColumn;
  }

  async getTasks(boardId: string) {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .in('column_id', (await this.getColumns(boardId)).map(c => c.id))
      .order('position', { ascending: true });

    if (error) throw error;
    return data as any[]; // Using any for tasks since we haven't defined a full model for assignee user yet
  }

  async updateTask(id: string, updates: Partial<any>) {
    const { data, error } = await this.supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  subscribeToBoardChanges(boardId: string, onUpdate: () => void) {
    if (this.channels.has(boardId)) {
      return;
    }

    const channel = this.supabase
      .channel(`board-realtime-${boardId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'columns',
        filter: `board_id=eq.${boardId}` 
      }, () => onUpdate())
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks'
      }, async (payload: any) => {
        // We filter tasks in the callback because cross-table filters are complex in Supabase realtime
        const taskId = payload.new?.id || payload.old?.id;
        if (taskId) {
           onUpdate();
        }
      })
      .subscribe();

    this.channels.set(boardId, channel);
  }

  unsubscribeFromBoard(boardId: string) {
    const channel = this.channels.get(boardId);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(boardId);
    }
  }
}

