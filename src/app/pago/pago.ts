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
    this.checkoutService.aprobarPagoDemo(this.numeroPedido).subscribe({
      next: (resp) => {
        localStorage.setItem('pedido_mp', this.numeroPedido);
        this.router.navigate(['/confirmacion'], {
          queryParams: {
            status: 'approved',
            payment_id: resp.payment_id,
            external_reference: this.numeroPedido,
          },
        });
      },
      error: () => {
        this.error = 'No pudimos procesar el pago. Intenta nuevamente.';
        this.cargando = false;
      },
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
