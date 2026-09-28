import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warn';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warn' = 'success', duration = 4000): void {
    if (!message || !message.trim()) return;

    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastItem = { id, message: message.trim(), type, duration };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  warn(message: string, duration = 4500): void {
    this.show(message, 'warn', duration);
  }

  remove(id: string): void {
    const updated = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(updated);
  }

  clear(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Helper to format backend HTTP errors into friendly human-readable strings
   */
  extractErrorMessage(err: any, fallback = 'Operation failed. Please try again.'): string {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err.error?.message) return err.error.message;
    if (err.error?.title) return err.error.title;
    
    // Check for ModelState validation errors
    if (err.error?.errors && typeof err.error.errors === 'object') {
      const messages: string[] = [];
      for (const key of Object.keys(err.error.errors)) {
        const val = err.error.errors[key];
        if (Array.isArray(val)) {
          messages.push(...val);
        } else if (typeof val === 'string') {
          messages.push(val);
        }
      }
      if (messages.length > 0) return messages.join(' ');
    }

    if (err.statusText && err.status) {
      return `Error [${err.status}]: ${err.statusText}`;
    }

    return err.message || fallback;
  }
}
