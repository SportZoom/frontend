import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  // URL de tu backend
  private backendUrl = 'https://tienda-backend-2g3c.onrender.com/api/checkout/pago/';
  private apiUrl = 'https://tienda-backend-2g3c.onrender.com/api';

  constructor(private http: HttpClient) {}

  // Confirmar pago
    confirmarPago(payload: any): Observable<any> {
    return this.http.post(this.backendUrl, payload);
  }

  // Obtener init params para Wompi Widget
  crearInitWompi(numeroPedido: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos/wompi/init/`, { numero_pedido: numeroPedido });
  }

  // Consultar estado de pago Wompi por numero_pedido
  estadoWompi(numeroPedido: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pagos/wompi/estado/${numeroPedido}/`);
  }

  // Consultar pedido por código
  consultarPedido(numeroPedido: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos/consultar/${numeroPedido}/`);
  }

  // Crear preferencia de Mercado Pago
  // crearPreferenciaMP(numeroPedido: string): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/pagos/crear-preferencia/`, {
  //     numero_pedido: numeroPedido
  //   });
  // }

  aprobarPagoDemo(numeroPedido: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos/demo-aprobado/${numeroPedido}/`, {});
  }

  // Consultar estado del pago
  // estadoPagoMP(numeroPedido: string): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/pagos/estado/${numeroPedido}/`);
  // }
}
