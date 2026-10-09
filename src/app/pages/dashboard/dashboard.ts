import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PortfolioAdminService, InquiryStats, InquiryItem } from '../../services/portfolio-admin.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  greeting = 'Welcome back!';
  adminName = 'Oluwatobi Adejoro';

  projectsCount = '0';
  projectsLabel = 'Production Web & Cloud APIs';
  experienceTenure = '0 Years';
  experienceLabel = 'Fullstack Enterprise Systems';
  articlesCount = '0';
  articlesLabel = 'Guides & Architecture Posts';
  inquiryStats: InquiryStats = {
    totalCount: 0,
    unreadCount: 0,
    archivedCount: 0,
    todayCount: 0
  };
  recentInquiries: InquiryItem[] = [];
  isLoading = true;

  public router = inject(Router);
  public authService = inject(AuthService);
  private adminService = inject(PortfolioAdminService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.adminName = user.fullName || user.email || 'Admin';
      }
      this.setGreeting();
    });

    this.loadDashboardData();
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    let prefix = 'Good morning';
    if (hour >= 12 && hour < 17) prefix = 'Good afternoon';
    else if (hour >= 17) prefix = 'Good evening';

    this.greeting = `${prefix}, ${this.adminName} 👋`;
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      inquiryStats: this.adminService.getInquiryStats().pipe(catchError(() => of({ totalCount: 0, unreadCount: 0, archivedCount: 0, todayCount: 0 }))),
      inquiries: this.adminService.getInquiries().pipe(catchError(() => of([]))),
      projects: this.adminService.getAdminProjects().pipe(catchError(() => of([]))),
      articles: this.adminService.getAdminArticles().pipe(catchError(() => of([]))),
      profile: this.adminService.getAdminProfile().pipe(catchError(() => of(null)))
    }).subscribe({
      next: (res) => {
        this.inquiryStats = res.inquiryStats;
        this.recentInquiries = (res.inquiries || []).slice(0, 5);

        // 1. Featured Projects
        if (res.profile?.projectsCompletedSuffix) {
          this.projectsCount = res.profile.projectsCompletedSuffix;
        } else if (res.profile?.projectsCompleted) {
          this.projectsCount = `${res.profile.projectsCompleted}+`;
        } else if (res.projects && res.projects.length > 0) {
          this.projectsCount = `${res.projects.length}+`;
        } else {
          this.projectsCount = '0';
        }
        if (res.profile?.projectsLabel) {
          this.projectsLabel = res.profile.projectsLabel;
        }

        // 2. Experience Tenure
        if (res.profile?.yearsExperienceSuffix) {
          this.experienceTenure = res.profile.yearsExperienceSuffix.toLowerCase().includes('year')
            ? res.profile.yearsExperienceSuffix
            : `${res.profile.yearsExperienceSuffix} Years`;
        } else if (res.profile?.yearsExperience) {
          this.experienceTenure = `${res.profile.yearsExperience}+ Years`;
        } else {
          this.experienceTenure = '0 Years';
        }
        if (res.profile?.yearsExperienceLabel) {
          this.experienceLabel = res.profile.yearsExperienceLabel;
        }

        // 3. Technical Articles
        this.articlesCount = res.articles ? `${res.articles.length}` : '0';

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  markAsRead(item: InquiryItem): void {
    if (item.isRead) return;
    this.adminService.toggleInquiryRead(item.id).subscribe({
      next: () => {
        item.isRead = true;
        if (this.inquiryStats.unreadCount > 0) {
          this.inquiryStats.unreadCount--;
        }
        this.cdr.detectChanges();
      }
    });
  }
}
