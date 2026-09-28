import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html'
})
export class HeaderComponent {
  @Input() pageTitle = 'Dashboard';
  @Output() toggleSidebar = new EventEmitter<void>();

  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public router = inject(Router);
  public isProfileOpen = signal(false);

  toggleProfile(): void {
    this.isProfileOpen.update(v => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  signOut(): void {
    this.isProfileOpen.set(false);
    this.authService.logout();
  }
}
