//import { Component, OnInit, isDevMode } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CheckoutService } from '../services/checkout.service';
import { CarritoService } from '../services/carrito.service';
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
    private carritoService: CarritoService,
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

    this.checkoutService.confirmarPago({
      numero_pedido,
      total: this.datos.total,
      nombre: this.datos.nombre,
      email: this.datos.email,
      direccion: this.datos.direccion
    }).subscribe({
      next: () => {
        localStorage.setItem('pedido_mp', numero_pedido);
        this.abrirWidgetWompi(numero_pedido);
      },
      error: () => {
        this.error = 'Error actualizando los datos del pedido.';
        this.cargando = false;
      }
    });
  }

  private abrirWidgetWompi(numeroPedido: string) {
    this.checkoutService.crearInitWompi(numeroPedido).subscribe({
      next: (init: any) => {
        try {
          const config: any = {
            currency: init.currency,
            amountInCents: init.amount_in_cents,
            reference: init.reference,
            publicKey: init.public_key,
            signature: { integrity: init.signature_integrity },
          };

          const checkout = new (window as any).WidgetCheckout(config);
          checkout.open((result: any) => {
            const transaction = result && result.transaction;
            const status = transaction ? (transaction.status || '').toLowerCase() : '';
            const paymentId = transaction ? transaction.id : '';
            const reference = transaction ? transaction.reference : init.reference;

            if (status === 'approved') {
              localStorage.setItem('pedido_mp', numeroPedido);
              this.router.navigate(['/confirmacion'], {
                queryParams: {
                  transaction_id: paymentId,
                  reference: reference,
                  numero_pedido: numeroPedido,
                },
              });
            } else {
              const mensajes: Record<string, string> = {
                declined: 'El pago fue rechazado. Verifica los datos e intenta nuevamente.',
                voided: 'El pago fue anulado.',
                error: 'Ocurrió un error al procesar el pago.',
              };
              const mensaje = mensajes[status] || 'El pago no pudo ser completado.';
              this.router.navigate(['/tienda'], {
                queryParams: { error: mensaje },
              });
            }
          });
        } catch (e) {
          console.error('Widget error', e);
          this.error = 'Error abriendo el widget de pago.';
          this.cargando = false;
        }
      },
      error: () => {
        this.error = 'No pudimos iniciar el pago. Intenta nuevamente.';
        this.cargando = false;
      }
    });
  }
}
