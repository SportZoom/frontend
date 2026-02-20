import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ← AGREGAR
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // ← AGREGAR FormsModule
  templateUrl: './admin-pedidos.html'
})
export class AdminPedidosComponent implements OnInit {
  pedidos: any[] = [];
  pedidosFiltrados: any[] = []; // ← AGREGAR
  cargando: boolean = false;
  apiUrl = 'http://127.0.0.1:8000/api';

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
    switch(estado) {
      case 'pagado': return 'bg-green-100 text-green-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'entregado': return 'bg-gray-100 text-gray-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'fallido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getEstadoTexto(estado: string): string {
    switch(estado) {
      case 'pagado': return 'Pagado';
      case 'enviado': return 'Enviado';
      case 'entregado': return 'Entregado';
      case 'pendiente': return 'Pendiente';
      case 'fallido': return 'Fallido';
      default: return estado;
    }
  }
}