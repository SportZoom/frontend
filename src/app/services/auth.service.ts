import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  //private baseUrl = '/api/token/';
  //private clienteLoginUrl = '/api/clientes/login/';
  private baseUrl = 'https://tienda-backend-2g3c.onrender.com/api/token/';
  private clienteLoginUrl = 'https://tienda-backend-2g3c.onrender.com/api/clientes/login/';

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

  loginCliente(correo: string, password: string) {
    return this.http.post(this.clienteLoginUrl, { correo, password });
  }

  guardarSesionCliente(res: any) {
    if (this.isBrowser()) {
      localStorage.setItem('token', res.access);
      localStorage.setItem('usuario', JSON.stringify({
        nombre: res.nombre,
        correo: res.correo,
        es_admin: false
      }));
    }
}
}
