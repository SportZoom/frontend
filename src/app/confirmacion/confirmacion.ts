import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { CarritoService } from '../services/carrito.service';
import { NotificationService } from '../services/notification.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmacion.html',
})
export class ConfirmacionComponent implements OnInit {
  recibo: any = null;
  cargando: boolean = true;
  statusMP: string = '';
  paymentId: string = '';

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private notificationService: NotificationService,
    private carritoService: CarritoService,
  ) {}

  ngOnInit() {
    // Leer query params que envía Mercado Pago al redirigir
    const status = this.route.snapshot.queryParamMap.get('status');
    const paymentId = this.route.snapshot.queryParamMap.get('payment_id');
    const externalRef = this.route.snapshot.queryParamMap.get('external_reference');

    // ¿Viene de Mercado Pago?
    if (status && externalRef) {
      this.statusMP = status;
      this.paymentId = paymentId || '';

      if (status === 'approved') {
        // Consultar el pedido al backend
        this.checkoutService.consultarPedido(externalRef).subscribe({
          next: (pedido) => {
            this.recibo = {
              numero_pedido: pedido.numero_pedido,
              nombre: pedido.nombre,
              email: pedido.email,
              direccion: pedido.direccion,
              total: pedido.total,
              carrito: pedido.carrito,
              fecha: new Date().toLocaleDateString('es-CO'),
              payment_id: paymentId,
            };
            // Guardar en localStorage como respaldo
            localStorage.setItem('ultimo_recibo', JSON.stringify(this.recibo));
            // Limpiar datos temporales
            localStorage.removeItem('numero_pedido');
            localStorage.removeItem('pedido_mp');
            this.carritoService.limpiarCarrito();
            this.cargando = false;
          },
          error: () => {
            // Si falla la consulta, intentar desde localStorage
            this.cargarDesdeLocalStorage();
          },
        });
      } else {
        // Pago rechazado o pendiente
        this.cargando = false;
      }
      return;
    }

    // Flujo anterior: viene por navegación interna (state o localStorage)
    const navigation = this.router.getCurrentNavigation();
    const stateRecibo = navigation?.extras.state?.['recibo'];

    if (stateRecibo) {
      this.recibo = stateRecibo;
      this.statusMP = 'approved';
      this.cargando = false;
    } else {
      this.cargarDesdeLocalStorage();
    }
  }

  private cargarDesdeLocalStorage() {
    const reciboGuardado = localStorage.getItem('ultimo_recibo');
    const pedidoMp = localStorage.getItem('pedido_mp');

    if (reciboGuardado) {
      try {
        this.recibo = JSON.parse(reciboGuardado);
        this.statusMP = 'approved';
        this.cargando = false;
      } catch (e) {
        this.cargando = false;
      }
    } else if (pedidoMp) {
      // Viene de PSE — consulta el pedido al backend
      this.checkoutService.consultarPedido(pedidoMp).subscribe({
        next: (pedido) => {
          this.recibo = {
            numero_pedido: pedido.numero_pedido,
            nombre: pedido.nombre,
            email: pedido.email,
            direccion: pedido.direccion,
            total: pedido.total,
            carrito: pedido.carrito,
            fecha: new Date().toLocaleDateString('es-CO'),
          };
          this.statusMP = 'approved';
          localStorage.setItem('ultimo_recibo', JSON.stringify(this.recibo));
          localStorage.removeItem('pedido_mp');
          localStorage.removeItem('numero_pedido');
          this.carritoService.limpiarCarrito();
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
    } else {
      this.cargando = false;
    }
  }

  get pagoAprobado(): boolean {
    return this.statusMP === 'approved' || (!this.statusMP && !!this.recibo);
  }

  get pagoRechazado(): boolean {
    return this.statusMP === 'rejected' || this.statusMP === 'cancelled';
  }

  get pagoPendiente(): boolean {
    return this.statusMP === 'pending' || this.statusMP === 'in_process';
  }

  volverATienda() {
    this.router.navigate(['/tienda']);
  }

  descargarPDF() {
    if (!this.recibo) return;

    try {
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Recibo de Compra', 105, 20, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      let y = 35;
      doc.text(`Número de pedido: ${this.recibo.numero_pedido || 'N/A'}`, 20, y);
      y += 10;
      doc.text(`Cliente: ${this.recibo.nombre || 'N/A'}`, 20, y);
      y += 10;
      doc.text(`Total: COP ${this.formatearPrecio(this.recibo.total || 0)}`, 20, y);
      y += 10;
      if (this.recibo.fecha) {
        doc.text(`Fecha: ${this.recibo.fecha}`, 20, y);
        y += 10;
      }
      if (this.paymentId) {
        doc.text(`ID de pago MP: ${this.paymentId}`, 20, y);
        y += 10;
      }

      doc.line(20, y, 190, y);
      y += 10;

      if (this.recibo.carrito?.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Productos:', 20, y);
        y += 10;
        doc.setFontSize(11);
        doc.text('Producto', 20, y);
        doc.text('Cant.', 120, y);
        doc.text('Precio', 150, y);
        doc.line(20, y + 2, 190, y + 2);
        y += 10;

        doc.setFont('helvetica', 'normal');
        this.recibo.carrito.forEach((item: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(item.nombre || item.producto || 'Producto', 20, y);
          doc.text(String(item.cantidad || 1), 120, y);
          doc.text(`COP ${this.formatearPrecio(item.precio || 0)}`, 150, y);
          y += 10;
        });

        doc.line(20, y, 190, y);
        y += 10;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`TOTAL: COP ${this.formatearPrecio(this.recibo.total)}`, 190, y, { align: 'right' });

      doc.save(`recibo_${this.recibo.numero_pedido || Date.now()}.pdf`);
    } catch (error) {
      this.notificationService.error('Error al generar el PDF. Intenta nuevamente.');
    }
  }

  private formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  }

  buscarPedidoPSE() {
    const pedidoMp = localStorage.getItem('pedido_mp') || localStorage.getItem('numero_pedido');
    if (pedidoMp) {
      this.cargando = true;
      this.checkoutService.consultarPedido(pedidoMp).subscribe({
        next: (pedido) => {
          this.recibo = {
            numero_pedido: pedido.numero_pedido,
            nombre: pedido.nombre,
            email: pedido.email,
            direccion: pedido.direccion,
            total: pedido.total,
            carrito: pedido.carrito,
            fecha: new Date().toLocaleDateString('es-CO'),
          };
          this.statusMP = 'approved';
          localStorage.setItem('ultimo_recibo', JSON.stringify(this.recibo));
          localStorage.removeItem('pedido_mp');
          localStorage.removeItem('numero_pedido');
          this.carritoService.limpiarCarrito();
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
          this.notificationService.error('No se encontro el pedido. Verifica tu correo.');
        },
      });
    } else {
      this.volverATienda();
    }
  }
}
