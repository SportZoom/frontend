import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class LoginComponent {
  username = '';
  password = '';
  cargando = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion() {
    if (!this.username || !this.password) {
      this.errorMsg = 'Por favor, ingrese usuario y contraseña.';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        const token = res.access || res.token;
        if (token) {
          this.authService.guardarToken(token);

          localStorage.setItem(
            'usuario',
            JSON.stringify({ username: this.username, es_admin: true })
          );

          alert('Inicio de sesión exitoso');
          this.router.navigate(['/tienda']);
        } else {
          this.errorMsg = 'Token no recibido del servidor.';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error en inicio de sesión:', err);
        this.errorMsg = 'Credenciales incorrectas o error en el servidor.';
        this.cargando = false;
      },
    });
  }
}
