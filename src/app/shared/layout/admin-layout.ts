import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './admin-layout.html'
})
export class AdminLayoutComponent implements OnInit {
  isMobOpen = false;
  isCollapsed = false;
  currentPageTitle = 'Dashboard';

  private router = inject(Router);

  private titles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/projects': 'Projects & Works',
    '/articles': 'Articles & Publications',
    '/resume': 'Resume & Experience',
    '/profile': 'Profile & Bio',
    '/inquiries': 'Contact Inquiries'
  };

  ngOnInit(): void {
    this.updateTitle(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects);
      if (this.isMob()) this.isMobOpen = false;
    });
  }

  updateTitle(url: string): void {
    const key = Object.keys(this.titles).find(k => url.startsWith(k));
    this.currentPageTitle = key ? this.titles[key] : 'Dashboard';
  }

  isMob(): boolean {
    return window.innerWidth <= 900;
  }

  handleToggleSidebar(): void {
    if (this.isMob()) {
      this.isMobOpen = !this.isMobOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isMob()) {
      this.isMobOpen = false;
    }
  }
}
