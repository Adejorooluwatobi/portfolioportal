import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() isCollapsed = false;

  public authService = inject(AuthService);
  private router = inject(Router);

  signOut(): void {
    this.authService.logout();
  }

  get monogram(): string {
    const user = this.authService.currentUserValue;
    const name = user?.fullName || '';
    if (!name) return 'OA';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'OA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}
