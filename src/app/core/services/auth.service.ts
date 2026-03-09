import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, of, tap } from 'rxjs';
import {
  AuthCheckResponse,
  LoginRequest,
  LoginResponse,
} from '../models/login.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private router = inject(Router);
  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response: LoginResponse) => {
          this.setSession(response);
          this.router.navigate(['/dashboard']);
        }),
      );
  }
  logout() {
    return this.http
      .post(`${this.apiUrl}/logout`, {})
      .pipe(tap(() => this.clearSession()));
  }

  checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return of(false);
    }

    return this.http.get<AuthCheckResponse>(`${this.apiUrl}/auth-check`).pipe(
      map((response) => response.authenticated),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  private setSession(response: LoginResponse) {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  private clearSession() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}
