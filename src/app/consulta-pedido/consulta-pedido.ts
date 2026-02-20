import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; 
import { CheckoutService } from '../services/checkout.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-consulta-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consulta-pedido.html',
})
export class ConsultaPedidoComponent {
  numeroPedido: string = '';
  pedido: any = null;
  error: string = '';
  buscando: boolean = false;
  cantidadCarrito: number = 0;

  constructor(private checkoutService: CheckoutService, private carritoService: CarritoService) {}

  ngOnInit() {
    this.carritoService.carrito$.subscribe(productos => {
      this.cantidadCarrito = productos.reduce((total, p) => total + p.cantidad, 0);
    });
    const carritoActual = this.carritoService.obtenerCarrito();
    this.cantidadCarrito = carritoActual.reduce((total, p) => total + p.cantidad, 0);
  }

  buscarPedido() {
    if (!this.numeroPedido.trim()) {
      this.error = 'Por favor ingresa un código de pedido';
      return;
    }

    this.buscando = true;
    this.error = '';
    this.pedido = null;

    this.checkoutService.consultarPedido(this.numeroPedido.trim()).subscribe({
      next: (response) => {
        this.pedido = response;
        this.buscando = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'No se encontró el pedido';
        this.buscando = false;
      }
    });
  }

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'pagado': return 'text-green-600 bg-green-100';
      case 'pendiente': return 'text-yellow-600 bg-yellow-100';
      case 'fallido': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getEstadoTexto(estado: string): string {
    switch(estado) {
      case 'pagado': return 'Pagado';
      case 'pendiente': return 'Pendiente de pago';
      case 'fallido': return 'Pago fallido';
      default: return estado;
    }
  }
}
