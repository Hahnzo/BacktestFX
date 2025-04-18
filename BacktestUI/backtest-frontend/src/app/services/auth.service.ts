import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  private jwtHelper = new JwtHelperService();
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next({
        id: parseInt(decodedToken.nameid),
        username: decodedToken.unique_name,
        email: decodedToken.email,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    }
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    console.log('Tapped',this.apiUrl);
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        tap(response => this.handleAuthentication(response.token))
      );
  }

  test(): any {
    console.log('test');
    return this.http.get(`${this.apiUrl}/health`);
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    console.log('Attempting login to:', `${this.apiUrl}/login`);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          this.handleAuthentication(response.token);
        }),
        catchError(error => {
          console.error('Login error details:', error);
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

get token(): string | null {
  const token = localStorage.getItem('token');
  // Optional: Add console.log to debug
  console.log('Current token:', token);
  return token;
}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private handleAuthentication(token: string): void {
    localStorage.setItem('token', token);
    const decodedToken = this.jwtHelper.decodeToken(token);
    
    this.currentUserSubject.next({
      id: parseInt(decodedToken.nameid),
      username: decodedToken.unique_name,
      email: decodedToken.email,
      createdAt: new Date(),
      lastLogin: new Date()
    });
  }
}