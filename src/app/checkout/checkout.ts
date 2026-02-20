import { Component, OnInit } from '@angular/core';
import { CheckoutService } from '../services/checkout.service';
import { CarritoService } from '../services/carrito.service'; // ← AGREGAR
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

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

  private readonly EMAILJS_SERVICE_ID = 'service_sportzoom'; 
  private readonly EMAILJS_TEMPLATE_ID = 'template_7z7kclu'; 
  private readonly EMAILJS_PUBLIC_KEY = 'G7vZ4iZaaFd7smpNk';     

  constructor(
    private checkoutService: CheckoutService,
    private carritoService: CarritoService, // ← AGREGAR
    private router: Router
  ) {}

  ngOnInit() {
    // Calcular el total automáticamente del carrito
    const carrito = this.carritoService.obtenerCarrito();
    this.datos.subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    this.datos.iva = this.datos.subtotal * 0.19;
    this.datos.total = this.datos.subtotal + this.datos.iva;
    
    console.log('Subtotal:', this.datos.subtotal);
    console.log('IVA (19%):', this.datos.iva);
    console.log('Total:', this.datos.total);
  }

  pagar() {
    this.cargando = true;
    this.error = '';

    // Recupera el número de pedido creado
    const numero_pedido = localStorage.getItem("numero_pedido");

    if (!numero_pedido) {
      this.error = 'No hay pedido registrado';
      this.cargando = false;
      return;
    }

    console.log('Iniciando pago para pedido:', numero_pedido);

    // Llamada al backend simulado
    this.checkoutService.confirmarPago({
      numero_pedido: numero_pedido,
      total: this.datos.total,
      nombre: this.datos.nombre,
      email: this.datos.email,        
      direccion: this.datos.direccion
    })
    .subscribe({
      next: (resp) => {
        console.log('Respuesta del servicio:', resp);
        
        // Crear objeto de recibo completo
        const recibo = {
          numero_pedido: numero_pedido,
          nombre: this.datos.nombre,
          email: this.datos.email,
          direccion: this.datos.direccion,
          total: this.datos.total,
          fecha: new Date().toLocaleDateString('es-CO'),
          carrito: resp.carrito || [], 
          ...resp 
        };

        console.log('Recibo completo a enviar:', recibo);

        // parámetros de EmailJS
        const templateParams = {
          to_name: recibo.nombre,
          to_email: this.datos.email,
          numero_pedido: recibo.numero_pedido,
          fecha: recibo.fecha,
          direccion: this.datos.direccion,
          total: recibo.total,
          productos: (recibo.carrito || []).map((item: any) => {
            const nombre = item.nombre || item.producto || 'Producto';
            const cantidad = item.cantidad || 1;
            const precio = item.precio || item.precio_unitario || 0;

            return `
              <tr>
                <td>${nombre}</td>
                <td style="text-align: center;">${cantidad}</td>
                <td style="text-align: right;">COP $${precio.toLocaleString('es-CO')}</td>
              </tr>
            `;
          }).join('')
        };

        // envio del correo
        emailjs.send(this.EMAILJS_SERVICE_ID, this.EMAILJS_TEMPLATE_ID, templateParams, this.EMAILJS_PUBLIC_KEY)
          .then(response => console.log('Correo enviado', response.status, response.text))
          .catch(err => console.error('Error enviando correo', err));

        // Guardar en localStorage como respaldo
        localStorage.setItem('ultimo_recibo', JSON.stringify(recibo));
        
        setTimeout(() => {
          this.router.navigate(['/confirmacion'], {
            state: { recibo: recibo }
          }).then(success => {
            console.log('Navegación exitosa:', success);
          }).catch(error => {
            console.error('Error en navegación:', error);
          });
        }, 100);
      },
      error: (err) => {
        console.error('Error en el servicio:', err);
        this.error = 'Error procesando el pago';
        this.cargando = false;
      }
    });
  }
}