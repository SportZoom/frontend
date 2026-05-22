import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-pedidos.html',
})
export class MisPedidosComponent implements OnInit {
  pedidos: any[] = [];
  cargando = true;
  error = '';
  cantidadCarrito = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit() {
    const usuario = this.authService.obtenerUsuarioActual();
    if (!usuario || usuario.es_admin) {
      this.router.navigate(['/login']);
      return;
    }

    this.carritoService.carrito$.subscribe(productos => {
      this.cantidadCarrito = productos.reduce((total, p) => total + p.cantidad, 0);
    });

    this.cargarPedidos();
  }

  cargarPedidos() {
    const headers = this.authService.obtenerCabeceraAuth();
    this.http.get<any[]>('https://tienda-backend-2g3c.onrender.com/api/clientes/mis-pedidos/', { headers }).subscribe({
      next: (res) => {
        this.pedidos = res;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus pedidos.';
        this.cargando = false;
      }
    });
  }

  getEstadoClass(estado: string): string {
    const clases: Record<string, string> = {
      comprado:    'bg-blue-100 text-blue-700 border-blue-300',
      enviado:     'bg-yellow-100 text-yellow-700 border-yellow-300',
      en_reparto:  'bg-orange-100 text-orange-700 border-orange-300',
      entregado:   'bg-green-100 text-green-700 border-green-300',
    };
    return clases[estado] ?? 'bg-gray-100 text-gray-700 border-gray-300';
  }

  verDetalle(numeroPedido: string) {
    this.router.navigate(['/consulta-pedido'], {
      queryParams: { codigo: numeroPedido }
    });
  }

  rastrearPedido(numeroPedido: string) {
    this.router.navigate(['/pedidos', numeroPedido, 'rastreo']);
  }
}
