import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, FormsModule, RouterLink],
})
export class LoginComponent {
  pestanaActiva: 'cliente' | 'admin' = 'cliente';

  // Cliente
  correo = '';
  passwordCliente = '';

  // Admin
  username = '';
  passwordAdmin = '';

  cargando = false;
  errorMsg = '';
  
  mostrarPasswordCliente = false;
  mostrarPasswordAdmin = false;

  constructor(private authService: AuthService, private router: Router) {}

  cambiarPestana(pestana: 'cliente' | 'admin') {
    this.pestanaActiva = pestana;
    this.errorMsg = '';
  }

  iniciarSesion() {
    this.errorMsg = '';

    if (this.pestanaActiva === 'cliente') {
      if (!this.correo || !this.passwordCliente) {
        this.errorMsg = 'Por favor, ingresa tu correo y contraseña.';
        return;
      }
      this.cargando = true;
      this.authService.loginCliente(this.correo, this.passwordCliente).subscribe({
        next: (res: any) => {
          this.authService.guardarSesionCliente(res);
          this.router.navigate(['/tienda']);
          this.cargando = false;
        },
        error: (err) => {
          this.errorMsg = err.error?.non_field_errors?.[0] || 'Correo o contraseña incorrectos.';
          this.cargando = false;
        },
      });
    } else {
      if (!this.username || !this.passwordAdmin) {
        this.errorMsg = 'Por favor, ingresa usuario y contraseña.';
        return;
      }
      this.cargando = true;
      this.authService.login(this.username, this.passwordAdmin).subscribe({
        next: (res: any) => {
          const token = res.access || res.token;
          if (token) {
            this.authService.guardarToken(token);
            localStorage.setItem('usuario', JSON.stringify({
              username: this.username,
              nombre: this.username,
              es_admin: true
            }));
            this.router.navigate(['/tienda']);
          } else {
            this.errorMsg = 'Token no recibido del servidor.';
          }
          this.cargando = false;
        },
        error: () => {
          this.errorMsg = 'Credenciales incorrectas o error en el servidor.';
          this.cargando = false;
        },
      });
    }
  }
}
