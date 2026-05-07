import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  // URL de tu backend
  private backendUrl = '/api/checkout/pago/';
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Confirmar pago 
    confirmarPago(payload: any): Observable<any> {
    return this.http.post(this.backendUrl, payload);
  }

  // Consultar pedido por código
  consultarPedido(numeroPedido: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos/consultar/${numeroPedido}/`);
  }

  // Crear preferencia de Mercado Pago
  crearPreferenciaMP(numeroPedido: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos/crear-preferencia/`, {
      numero_pedido: numeroPedido
    });
  }

  aprobarPagoDemo(numeroPedido: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos/demo-aprobado/${numeroPedido}/`, {});
  }

  // Consultar estado del pago
  estadoPagoMP(numeroPedido: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pagos/estado/${numeroPedido}/`);
  }
}
