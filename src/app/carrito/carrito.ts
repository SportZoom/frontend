import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CarritoService } from '../services/carrito.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
})
export class CarritoComponent implements OnInit {
  productos: any[] = [];

  constructor(
    private carritoService: CarritoService,
    private router: Router,
    private http: HttpClient,
    private notificationService: NotificationService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.productos = this.carritoService.obtenerCarrito();

    this.carritoService.carrito$.subscribe((productos) => {
      this.productos = productos;
    });
  }

  eliminar(id: number): void {
    this.carritoService.eliminarProducto(id);
  }

  async vaciarCarrito(): Promise<void> {
    const confirmar = await this.confirmDialogService.request({
      title: 'Vaciar carrito',
      message: 'Se eliminaran todos los productos que tienes agregados al carrito.',
      cancelText: 'Cancelar',
      confirmText: 'Vaciar carrito'
    });

    if (confirmar) {
      this.carritoService.limpiarCarrito();
      this.notificationService.info('Carrito vaciado');
    }
  }

  get total(): number {
    return this.carritoService.calcularTotal();
  }

  aumentarCantidad(id: number): void {
    this.carritoService.aumentarCantidad(id);
  }

  disminuirCantidad(id: number): void {
    this.carritoService.disminuirCantidad(id);
  }

  finalizarCompra() {
    const pedidoPayload = {
      nombre: '',
      email: '',
      direccion: '',
      total: this.total,
      carrito: this.productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: p.cantidad || 1,
        imagen: p.imagen
      }))
    };

    this.http.post('https://tienda-backend-2g3c.onrender.com/api/checkout/crear-pedido/', pedidoPayload)
      .subscribe({
        next: (resp: any) => {
          localStorage.setItem('numero_pedido', resp.numero_pedido);
          this.router.navigate(['/checkout']);
        },
        error: (err) => {
          console.error('Error al crear pedido:', err);
          this.notificationService.error('Error al crear el pedido, intenta de nuevo.');
        }
      });
  }
}
