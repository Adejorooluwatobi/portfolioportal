import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/admin/auth`;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('portfolio_current_user');
    if (saved) {
      try {
        this.currentUserSubject.next(JSON.parse(saved));
      } catch {
        localStorage.removeItem('portfolio_current_user');
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('portfolio_current_user', JSON.stringify(res));
          localStorage.setItem('portfolio_auth_token', res.token);
          this.currentUserSubject.next(res);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('portfolio_current_user');
    localStorage.removeItem('portfolio_auth_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value?.token;
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token || localStorage.getItem('portfolio_auth_token') || null;
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }
}
