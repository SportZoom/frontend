import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { CarritoService } from '../services/carrito.service';
import { NotificationService } from '../services/notification.service';
import jsPDF from 'jspdf';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmacion.html',
})
export class ConfirmacionComponent implements OnInit {
  recibo: any = null;
  cargando: boolean = true;
  statusPago: string = '';
  paymentId: string = '';
  errorMensaje: string = '';
  private numeroPedido: string = '';

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private notificationService: NotificationService,
    private carritoService: CarritoService,
  ) {}

  private readonly EMAILJS_SERVICE_ID = 'service_sportzoom';
  private readonly EMAILJS_TEMPLATE_ID = 'template_7z7kclu';
  private readonly EMAILJS_PUBLIC_KEY = 'G7vZ4iZaaFd7smpNk';

  ngOnInit() {
    const transactionId = this.route.snapshot.queryParamMap.get('transaction_id');
    const reference = this.route.snapshot.queryParamMap.get('reference');
    this.numeroPedido = this.route.snapshot.queryParamMap.get('numero_pedido') || '';
    this.numeroPedido = this.numeroPedido || localStorage.getItem('pedido_mp') || '';

    if (!this.numeroPedido) {
      this.cargando = false;
      this.errorMensaje = 'No se encontró información del pedido.';
      return;
    }

    this.verificarPago();
  }

  private verificarPago() {
    this.checkoutService.estadoWompi(this.numeroPedido).subscribe({
      next: (res: any) => {
        this.statusPago = res.estado || 'pending';
        this.paymentId = res.payment_id || '';

        if (res.estado === 'approved') {
          this.cargarPedido();
        } else if (res.estado === 'rejected' || res.estado === 'cancelled' || res.estado === 'declined' || res.estado === 'error') {
          this.errorMensaje = 'El pago no fue aprobado.';
          this.cargando = false;
        } else {
          // Pendiente — hacer polling
          this.pollingEstado();
        }
      },
      error: () => {
        // Fallback: consultar pedido directamente
        this.cargarPedidoDirecto();
      },
    });
  }

  private pollingEstado() {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts += 1;
      this.checkoutService.estadoWompi(this.numeroPedido).subscribe({
        next: (res: any) => {
          if (res.estado === 'approved') {
            clearInterval(interval);
            this.statusPago = 'approved';
            this.paymentId = res.payment_id || '';
            this.cargarPedido();
          } else if (['rejected', 'cancelled', 'declined', 'error'].includes(res.estado)) {
            clearInterval(interval);
            this.statusPago = res.estado;
            this.errorMensaje = 'El pago no fue aprobado.';
            this.cargando = false;
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            this.cargarPedidoDirecto();
          }
        },
        error: () => {
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            this.cargarPedidoDirecto();
          }
        },
      });
    }, 3000);
  }

  private cargarPedido() {
    this.checkoutService.consultarPedido(this.numeroPedido).subscribe({
      next: (pedido) => {
        this.recibo = {
          numero_pedido: pedido.numero_pedido,
          nombre: pedido.nombre,
          email: pedido.email,
          direccion: pedido.direccion,
          total: pedido.total,
          carrito: pedido.carrito,
          fecha: pedido.fecha
            ? new Date(pedido.fecha).toLocaleDateString('es-CO')
            : new Date().toLocaleDateString('es-CO'),
          payment_id: this.paymentId,
        };
        localStorage.setItem('ultimo_recibo', JSON.stringify(this.recibo));
        this.enviarEmailRecibo();
        localStorage.removeItem('numero_pedido');
        localStorage.removeItem('pedido_mp');
        this.carritoService.limpiarCarrito();
        this.cargando = false;
      },
      error: () => {
        this.cargarDesdeLocalStorage();
      },
    });
  }

  private cargarPedidoDirecto() {
    this.checkoutService.consultarPedido(this.numeroPedido).subscribe({
      next: (pedido) => {
        if (pedido.estado === 'comprado' || pedido.estado_actual === 'comprado') {
          this.recibo = {
            numero_pedido: pedido.numero_pedido,
            nombre: pedido.nombre,
            email: pedido.email,
            direccion: pedido.direccion,
            total: pedido.total,
            carrito: pedido.carrito,
            fecha: pedido.fecha
              ? new Date(pedido.fecha).toLocaleDateString('es-CO')
              : new Date().toLocaleDateString('es-CO'),
          };
          this.statusPago = 'approved';
          localStorage.setItem('ultimo_recibo', JSON.stringify(this.recibo));
          this.enviarEmailRecibo();
          localStorage.removeItem('numero_pedido');
          localStorage.removeItem('pedido_mp');
          this.carritoService.limpiarCarrito();
          this.cargando = false;
        } else {
          this.cargarDesdeLocalStorage();
        }
      },
      error: () => {
        this.cargarDesdeLocalStorage();
      },
    });
  }

  private cargarDesdeLocalStorage() {
    const reciboGuardado = localStorage.getItem('ultimo_recibo');
    if (reciboGuardado) {
      try {
        this.recibo = JSON.parse(reciboGuardado);
        this.statusPago = 'approved';
        this.cargando = false;
        this.enviarEmailRecibo();
      } catch (e) {
        this.cargando = false;
      }
    } else {
      this.cargando = false;
    }
  }

  get pagoAprobado(): boolean {
    return this.statusPago === 'approved' || (!this.statusPago && !!this.recibo);
  }

  get pagoRechazado(): boolean {
    return ['rejected', 'cancelled', 'declined'].includes(this.statusPago);
  }

  get pagoPendiente(): boolean {
    return this.statusPago === 'pending' || this.statusPago === 'in_process';
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

  // Envia el email con EmailJS si no se ha enviado antes para este pedido.
  private enviarEmailRecibo() {
  if (!this.recibo || !this.recibo.email) return;

  const pedidoId = this.recibo.numero_pedido;
  if (!pedidoId) return;

  const flagKey = `email_enviado_${pedidoId}`;
  if (localStorage.getItem(flagKey)) return;

  const productosHtml = (this.recibo.carrito || []).map((item: any) => `
    <tr>
      <td>${item.nombre || item.producto || 'Producto'}</td>
      <td style="text-align: center;">${item.cantidad || 1}</td>
      <td style="text-align: right;">COP $${new Intl.NumberFormat('es-CO').format(item.precio || 0)}</td>
    </tr>
  `).join('');

  const templateParams: Record<string, any> = {
    to_name: this.recibo.nombre || '',
    to_email: this.recibo.email,
    numero_pedido: pedidoId,
    fecha: this.recibo.fecha || new Date().toLocaleDateString('es-CO'),
    direccion: this.recibo.direccion || 'No especificada',
    total: new Intl.NumberFormat('es-CO').format(this.recibo.total || 0),
    productos: productosHtml,
  };

  emailjs.send(this.EMAILJS_SERVICE_ID, this.EMAILJS_TEMPLATE_ID, templateParams, this.EMAILJS_PUBLIC_KEY)
    .then(() => {
      localStorage.setItem(flagKey, '1');
      this.notificationService.success('Hemos enviado el correo de confirmación.');
    })
    .catch((err) => {
      console.error('EmailJS error:', err.status, err.text);
      this.notificationService.error('No se pudo enviar el correo de confirmación. Intenta más tarde.');
    });
}

  buscarPedidoPSE() {
    const pedidoMp = localStorage.getItem('pedido_mp') || localStorage.getItem('numero_pedido');
    if (pedidoMp) {
      this.cargando = true;
      this.checkoutService.consultarPedido(pedidoMp).subscribe({
        next: (pedido) => {
          console.log('PEDIDO BACKEND:', JSON.stringify(pedido));
          this.recibo = {
            numero_pedido: pedido.numero_pedido,
            nombre: pedido.nombre,
            email: pedido.email,
            direccion: pedido.direccion,
            total: pedido.total,
            carrito: pedido.carrito,
            fecha: pedido.fecha
              ? new Date(pedido.fecha).toLocaleDateString('es-CO')
              : new Date().toLocaleDateString('es-CO'),
          };
          this.statusPago = 'approved';
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
