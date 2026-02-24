import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Task, Comment, Tag } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private supabase: SupabaseClient;
  private commentChannels: Map<string, RealtimeChannel> = new Map();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async createTask(columnId: string, title: string, position: number) {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert({ column_id: columnId, title, position })
      .select('*')
      .single();

    if (error) throw error;
    return data as any as Task;
  }

  async getTask(id: string) {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as any as Task;
  }

  async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await this.supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as any as Task;
  }

  async getComments(taskId: string) {
    const { data, error } = await this.supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as any as Comment[];
  }

  async addComment(taskId: string, content: string) {
    const { data, error } = await this.supabase
      .from('comments')
      .insert({ task_id: taskId, content })
      .select('*')
      .single();

    if (error) throw error;
    return data as any as Comment;
  }

  async getBoardTags(boardId: string) {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('board_id', boardId);

    if (error) throw error;
    return data as Tag[];
  }

  async getTaskTags(taskId: string) {
    const { data, error } = await this.supabase
      .from('task_tags')
      .select('tags(*)')
      .eq('task_id', taskId);

    if (error) throw error;
    return (data || []).map((item: any) => item.tags) as Tag[];
  }

  async addTaskTag(taskId: string, tagId: string) {
    const { error } = await this.supabase
      .from('task_tags')
      .insert({ task_id: taskId, tag_id: tagId });

    if (error) throw error;
  }

  async removeTaskTag(taskId: string, tagId: string) {
    const { error } = await this.supabase
      .from('task_tags')
      .delete()
      .eq('task_id', taskId)
      .eq('tag_id', tagId);

    if (error) throw error;
  }

  async createTag(boardId: string, name: string, color: string) {
    const { data, error } = await this.supabase
      .from('tags')
      .insert({ board_id: boardId, name, color })
      .select()
      .single();

    if (error) throw error;
    return data as Tag;
  }

  subscribeToComments(taskId: string, onComment: () => void): RealtimeChannel {
    const channel = this.supabase
      .channel(`comments-${taskId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `task_id=eq.${taskId}`
      }, () => onComment())
      .subscribe();
    
    return channel;
  }
}
