import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
})
export class RegistroComponent {
  nombre = '';
  correo = '';
  genero = '';
  password = '';
  confirmarPassword = '';
  aceptaTerminos = false;
  cargando = false;
  errorMsg = '';
  exitoso = false;

  private apiUrl = 'http://localhost:8000/api/clientes/registro/';

  constructor(private http: HttpClient, private router: Router) {}

  registrar() {
    this.errorMsg = '';

    // Validaciones
    if (!this.nombre || !this.correo || !this.genero || !this.password || !this.confirmarPassword) {
      this.errorMsg = 'Por favor, completa todos los campos obligatorios.';
      return;
    }
    if (this.password !== this.confirmarPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }
    if (!this.aceptaTerminos) {
      this.errorMsg = 'Debes aceptar los términos y condiciones.';
      return;
    }

    this.cargando = true;

    this.http.post<any>(this.apiUrl, {
      nombre: this.nombre,
      correo: this.correo,
      genero: this.genero,
      password: this.password,
      acepta_terminos: this.aceptaTerminos,
    }).subscribe({
      next: (res) => {
        // Guardar token y datos del cliente
        localStorage.setItem('token_cliente', res.access);
        localStorage.setItem('cliente', JSON.stringify({
          nombre: res.nombre,
          correo: res.correo,
          es_cliente: true,
        }));
        this.exitoso = true;
        this.cargando = false;
        setTimeout(() => this.router.navigate(['/tienda']), 1500);
      },
      error: (err) => {
        const errores = err.error;
        if (typeof errores === 'object') {
          // Toma el primer error que devuelva Django
          const primerCampo = Object.values(errores)[0];
          this.errorMsg = Array.isArray(primerCampo) ? primerCampo[0] as string : String(primerCampo);
        } else {
          this.errorMsg = 'Error al registrarse. Intenta de nuevo.';
        }
        this.cargando = false;
      },
    });
  }
}