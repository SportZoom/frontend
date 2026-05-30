import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { CheckoutService } from '../services/checkout.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-consulta-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  templateUrl: './consulta-pedido.html',
})
export class ConsultaPedidoComponent {
  numeroPedido: string = '';
  pedido: any = null;
  error: string = '';
  buscando: boolean = false;
  cantidadCarrito: number = 0;
  vieneDePedidos: boolean = false;

  constructor(private checkoutService: CheckoutService, private carritoService: CarritoService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.carritoService.carrito$.subscribe(productos => {
      this.cantidadCarrito = productos.reduce((total, p) => total + p.cantidad, 0);
    });
    const carritoActual = this.carritoService.obtenerCarrito();
    this.cantidadCarrito = carritoActual.reduce((total, p) => total + p.cantidad, 0);

    this.route.queryParams.subscribe(params => {
      if (params['codigo']) {
        this.vieneDePedidos = true;
        this.numeroPedido = params['codigo'];
        this.buscarPedido();
      }
    });
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
    const clases: Record<string, string> = {
      comprado:   'text-blue-700 bg-blue-100 border-blue-300',
      enviado:    'text-yellow-700 bg-yellow-100 border-yellow-300',
      en_reparto: 'text-orange-700 bg-orange-100 border-orange-300',
      entregado:  'text-green-700 bg-green-100 border-green-300',
    };
    return clases[estado] ?? 'text-gray-600 bg-gray-100 border-gray-300';
  }

  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      comprado:   'Comprado',
      enviado:    'Enviado',
      en_reparto: 'En reparto',
      entregado:  'Entregado',
    };
    return textos[estado] ?? estado;
  }
}
