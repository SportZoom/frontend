import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  // URL de tu backend
  private backendUrl = 'http://localhost:8000/api/checkout/pago/';
  private apiUrl = 'http://localhost:8000/api'; // ← AGREGAR ESTA LÍNEA

  constructor(private http: HttpClient) {}

  // Confirmar pago con backend simulado
  confirmarPago(payload: any): Observable<any> {
    return this.http.post(this.backendUrl, payload);
  }

  // Consultar pedido por código
  consultarPedido(numeroPedido: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos/consultar/${numeroPedido}/`);
  }
}
