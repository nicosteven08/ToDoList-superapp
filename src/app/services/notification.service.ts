import { Injectable, inject, effect } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { Task } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private supabase: SupabaseClient;
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private checkInterval: any;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    // Al iniciar, si hay usuario, empezamos a monitorear
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.startMonitoring(user.id);
        this.subscribeToMentions(user.id);
      } else {
        this.stopMonitoring();
      }
    });
  }

  private startMonitoring(userId: string) {
    this.checkAlarms(userId);
    // Verificar cada 5 minutos
    this.checkInterval = setInterval(() => this.checkAlarms(userId), 5 * 60 * 1000);
  }

  private stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private async checkAlarms(userId: string) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .from('tasks')
      .select('id, title, due_date')
      .not('due_date', 'is', null)
      .lte('due_date', tomorrow.toISOString())
      .gte('due_date', now.toISOString());

    if (error) {
      console.error('Error checking alarms:', error);
      return;
    }

    (data as Partial<Task>[]).forEach(task => {
      this.toastService.warning(`Tarea pronto a vencer: ${task.title}`, 10000);
    });
  }

  private subscribeToMentions(userId: string) {
    // Escuchar nuevos comentarios
    this.supabase
      .channel('mentions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments'
      }, async (payload) => {
        const newComment = payload.new as any;
        
        // Verificar si el comentario contiene una mención (ej: @id o @email)
        // Por simplicidad, buscaremos el email del usuario actual en el contenido
        const userEmail = this.authService.currentUser()?.email;
        if (userEmail && newComment.content.includes(`@${userEmail}`)) {
          this.toastService.info(`Has sido mencionado en un comentario`, 7000);
        }
      })
      .subscribe();
  }
}
