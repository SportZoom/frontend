import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.html',
})
export class PagoComponent implements OnInit {
  numeroPedido = '';
  total = 0;
  cargando = false;
  error = '';

  tarjeta = {
    numero: '',
    titular: '',
    vencimiento: '',
    cvv: '',
    documento: '',
  };

  constructor(
    private checkoutService: CheckoutService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.numeroPedido = localStorage.getItem('pedido_mp') || localStorage.getItem('numero_pedido') || '';
    if (!this.numeroPedido) {
      this.router.navigate(['/carrito']);
      return;
    }

    this.checkoutService.consultarPedido(this.numeroPedido).subscribe({
      next: (pedido) => {
        this.total = Number(pedido.total || 0);
      },
      error: () => {
        this.error = 'No pudimos cargar la información del pedido.';
      },
    });
  }

  get numeroTarjetaFormateado(): string {
    return this.tarjeta.numero.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  actualizarNumeroTarjeta(valor: string) {
    this.tarjeta.numero = valor.replace(/\D/g, '').slice(0, 16);
  }

  actualizarVencimiento(valor: string) {
    const limpio = valor.replace(/\D/g, '').slice(0, 4);
    this.tarjeta.vencimiento = limpio.length > 2
      ? `${limpio.slice(0, 2)}/${limpio.slice(2)}`
      : limpio;
  }

  confirmarPago() {
    this.error = '';

    if (!this.formularioValido()) {
      this.error = 'Revisa los datos de pago antes de continuar.';
      return;
    }

    this.cargando = true;
    this.checkoutService.crearInitWompi(this.numeroPedido).subscribe({
      next: (init) => {
        try {
          const config: any = {
            currency: init.currency,
            amountInCents: init.amount_in_cents,
            reference: init.reference,
            publicKey: init.public_key,
            signature: { integrity: init.signature_integrity },
          };

          // @ts-ignore - WidgetCheckout provisto por script externo
          const checkout = new (window as any).WidgetCheckout(config);
          checkout.open((result: any) => {
            const transaction = result && result.transaction;
            const status = transaction ? (transaction.status || '').toLowerCase() : '';
            const paymentId = transaction ? transaction.id : '';
            const reference = transaction ? transaction.reference : init.reference;

            if (status === 'approved') {
              localStorage.setItem('pedido_mp', this.numeroPedido);
              this.router.navigate(['/confirmacion'], {
                queryParams: {
                  transaction_id: paymentId,
                  reference: reference,
                  numero_pedido: this.numeroPedido,
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

  private formularioValido(): boolean {
    return (
      this.tarjeta.numero.length === 16 &&
      this.tarjeta.titular.trim().length >= 3 &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.tarjeta.vencimiento) &&
      /^\d{3,4}$/.test(this.tarjeta.cvv) &&
      this.tarjeta.documento.replace(/\D/g, '').length >= 6
    );
  }
}
