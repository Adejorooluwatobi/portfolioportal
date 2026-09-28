import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastItem } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="(toastService.toasts$ | async) as toasts">
      <div 
        *ngFor="let toast of toasts" 
        class="toast-item"
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-content">
          <!-- Success Icon -->
          <div *ngIf="toast.type === 'success'" class="toast-icon toast-icon-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>

          <!-- Error Icon -->
          <div *ngIf="toast.type === 'error'" class="toast-icon toast-icon-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>

          <!-- Warn Icon -->
          <div *ngIf="toast.type === 'warn'" class="toast-icon toast-icon-warn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <!-- Info Icon -->
          <div *ngIf="toast.type === 'info'" class="toast-icon toast-icon-info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>

          <!-- Message Body -->
          <div class="toast-text">
            <div class="toast-title">{{ getToastTitle(toast.type) }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
        </div>

        <!-- Dismiss Button -->
        <button 
          (click)="toastService.remove(toast.id)" 
          class="toast-dismiss"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 440px;
      width: calc(100vw - 48px);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 14px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(14px);
      color: #fff;
      border: 1px solid;
      animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s ease;
    }

    .toast-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .toast-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .toast-text {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-size: 13.5px;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 2px;
    }

    .toast-message {
      font-size: 12.5px;
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.9);
      word-break: break-word;
    }

    .toast-dismiss {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      padding: 4px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .toast-dismiss:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }

    /* Type-specific colors */
    .toast-success {
      background: rgba(6, 78, 59, 0.95);
      border-color: rgba(16, 185, 129, 0.6);
    }
    .toast-icon-success {
      background: rgba(16, 185, 129, 0.25);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    .toast-error {
      background: rgba(127, 29, 29, 0.95);
      border-color: rgba(239, 68, 68, 0.6);
    }
    .toast-icon-error {
      background: rgba(239, 68, 68, 0.25);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .toast-warn {
      background: rgba(120, 53, 15, 0.95);
      border-color: rgba(245, 158, 11, 0.6);
    }
    .toast-icon-warn {
      background: rgba(245, 158, 11, 0.25);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }

    .toast-info {
      background: rgba(30, 58, 138, 0.95);
      border-color: rgba(59, 130, 246, 0.6);
    }
    .toast-icon-info {
      background: rgba(59, 130, 246, 0.25);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.4);
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(40px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `]
})
export class ToastComponent {
  public toastService = inject(ToastService);

  getToastTitle(type: string): string {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warn': return 'Warning';
      case 'info': return 'Notice';
      default: return 'Notification';
    }
  }
}
