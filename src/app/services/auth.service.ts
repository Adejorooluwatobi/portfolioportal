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
    // Clean up any legacy localStorage tokens from past sessions so user always logs in fresh
    localStorage.removeItem('portfolio_current_user');
    localStorage.removeItem('portfolio_auth_token');

    // Retrieve active session from sessionStorage
    const saved = sessionStorage.getItem('portfolio_current_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (this.isTokenValid(user)) {
          this.currentUserSubject.next(user);
        } else {
          this.clearSession();
        }
      } catch {
        this.clearSession();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          sessionStorage.setItem('portfolio_current_user', JSON.stringify(res));
          sessionStorage.setItem('portfolio_auth_token', res.token);
          this.currentUserSubject.next(res);
        }
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private clearSession(): void {
    sessionStorage.removeItem('portfolio_current_user');
    sessionStorage.removeItem('portfolio_auth_token');
    localStorage.removeItem('portfolio_current_user');
    localStorage.removeItem('portfolio_auth_token');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && this.isTokenValid(user);
  }

  private isTokenValid(user: LoginResponse): boolean {
    if (!user || !user.token) return false;

    // 1. Check ISO expiration timestamp if provided
    if (user.expiresAt) {
      const expDate = new Date(user.expiresAt).getTime();
      if (!isNaN(expDate) && Date.now() >= expDate) {
        return false;
      }
    }

    // 2. Decode JWT exp claim as a fallback check
    try {
      const payloadBase64 = user.token.split('.')[1];
      if (payloadBase64) {
        const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          return false;
        }
      }
    } catch {
      // Continue if decode fails
    }

    return true;
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token || sessionStorage.getItem('portfolio_auth_token') || null;
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }
}
