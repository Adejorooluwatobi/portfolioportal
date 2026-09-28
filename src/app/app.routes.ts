import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/layout/admin-layout';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'projects', loadComponent: () => import('./pages/projects/projects').then(m => m.ProjectsComponent) },
      { path: 'articles', loadComponent: () => import('./pages/articles/articles').then(m => m.ArticlesComponent) },
      { path: 'resume', loadComponent: () => import('./pages/resume/resume').then(m => m.ResumeComponent) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent) },
      { path: 'inquiries', loadComponent: () => import('./pages/inquiries/inquiries').then(m => m.InquiriesComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
