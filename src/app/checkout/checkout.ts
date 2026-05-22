//import { Component, OnInit, isDevMode } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CheckoutService } from '../services/checkout.service';
import { CarritoService } from '../services/carrito.service'; // ← AGREGAR
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.html',
  imports: [CommonModule, FormsModule],
})
export class CheckoutComponent implements OnInit {

  datos = {
    nombre: '',
    email: '',
    direccion: '',
    subtotal: 0,
    iva: 0,
    total: 0
  };

  cargando = false;
  error = '';

  

  constructor(
    private checkoutService: CheckoutService,
    private carritoService: CarritoService, // ← AGREGAR
    private router: Router
  ) { }

  ngOnInit() {
    const carrito = this.carritoService.obtenerCarrito();
    this.datos.subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    this.datos.iva = this.datos.subtotal * 0.19;
    this.datos.total = this.datos.subtotal + this.datos.iva;

    // Prellenar nombre y email desde el usuario logueado
    const usuarioRaw = localStorage.getItem('usuario');
    if (usuarioRaw) {
      const usuario = JSON.parse(usuarioRaw);
      this.datos.nombre = usuario.nombre || usuario.username || '';
      this.datos.email = usuario.correo || '';
    }
  }

  pagar() {
    if (!this.datos.direccion.trim()) {
      this.error = 'La dirección de envío es obligatoria.';
      return;
    }
    this.cargando = true;
    this.error = '';

    const numero_pedido = localStorage.getItem('numero_pedido');

    if (!numero_pedido) {
      this.error = 'No hay pedido registrado';
      this.cargando = false;
      return;
    }

    // Primero actualiza nombre, email y dirección en el pedido
    this.checkoutService.confirmarPago({
      numero_pedido,
      total: this.datos.total,
      nombre: this.datos.nombre,
      email: this.datos.email,
      direccion: this.datos.direccion
    }).subscribe({
      next: () => {
        // if (isDevMode()) {
        //   localStorage.setItem('pedido_mp', numero_pedido);
        //   this.router.navigate(['/pago']);
        //   return;
        // }
        // Guardar pedido
        localStorage.setItem('pedido_mp', numero_pedido);

        // Luego crea la preferencia en Mercado Pago
        // this.checkoutService.crearPreferenciaMP(numero_pedido).subscribe({
        //   next: (resp) => {
        //     // Guarda el numero_pedido para usarlo en confirmación
        //     localStorage.setItem('pedido_mp', numero_pedido);
        //     // Redirige a Mercado Pago
        //     window.location.href = resp.sandbox_init_point; // cambiar a init_point en producción
        //   },
        this.router.navigate(['/pago']);
      },
      //   error: () => {
      //     this.error = 'Error al conectar con Mercado Pago. Intenta nuevamente.';
      //     this.cargando = false;
      //   }
      // });
      // },
      error: () => {
        this.error = 'Error actualizando los datos del pedido.';
        this.cargando = false;
      }
    });
  }
}
