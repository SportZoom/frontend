import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ← AGREGAR
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  templateUrl: './admin-pedidos.html'
})
export class AdminPedidosComponent implements OnInit {
  pedidos: any[] = [];
  pedidosFiltrados: any[] = []; // ← AGREGAR
  cargando: boolean = false;
  apiUrl = 'https://tienda-backend-2g3c.onrender.com/api';

  // Filtros
  filtroEstado: string = 'todos'; // ← AGREGAR
  filtroBusqueda: string = ''; // ← AGREGAR

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    const headers = this.authService.obtenerCabeceraAuth();

    this.http.get<any[]>(`${this.apiUrl}/admin/pedidos/`, { headers }).subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.aplicarFiltros(); // ← AGREGAR
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.notificationService.error('Error al cargar pedidos');
        this.cargando = false;
      }
    });
  }

  // ← NUEVA FUNCIÓN
  aplicarFiltros() {
    let resultado = [...this.pedidos];

    // Excluir pedidos con estado 'pendiente'
    resultado = resultado.filter(p => p.estado !== 'pendiente');

    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(p => p.estado === this.filtroEstado);
    }

    // Filtro por búsqueda (número de pedido, nombre, email)
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.numero_pedido.toLowerCase().includes(busqueda) ||
        (p.nombre && p.nombre.toLowerCase().includes(busqueda)) ||
        (p.email && p.email.toLowerCase().includes(busqueda))
      );
    }

    this.pedidosFiltrados = resultado;
  }

  cambiarEstado(numeroPedido: string, nuevoEstado: string) {
    const headers = this.authService.obtenerCabeceraAuth();

    this.http.patch(
      `${this.apiUrl}/admin/pedidos/${numeroPedido}/estado/`,
      { estado: nuevoEstado },
      { headers }
    ).subscribe({
      next: () => {
        this.notificationService.success('Estado actualizado correctamente');
        this.cargarPedidos();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.notificationService.error('Error al actualizar estado');
      }
    });
  }

  getEstadoClass(estado: string): string {
    const clases: Record<string, string> = {
      comprado:   'bg-blue-100 text-blue-800',
      enviado:    'bg-yellow-100 text-yellow-800',
      en_reparto: 'bg-orange-100 text-orange-800',
      entregado:  'bg-green-100 text-green-800',
    };
    return clases[estado] ?? 'bg-gray-100 text-gray-800';
  }

  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      comprado:   'Comprado',
      enviado:    'Enviado',
      en_reparto: 'En reparto',
      entregado:  'Entregado',
    };
    return textos[estado] ?? estado;
  }
}
