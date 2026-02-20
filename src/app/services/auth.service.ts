import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = '/api/token/';

  constructor(private http: HttpClient) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  login(username: string, password: string) {
    return this.http.post(this.baseUrl, { username, password });
  }

  guardarToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
    }
  }

  obtenerToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  obtenerUsuarioActual() {
    if (this.isBrowser()) {
      const user = localStorage.getItem('usuario');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  obtenerCabeceraAuth() {
    const token = this.obtenerToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
  }
}
