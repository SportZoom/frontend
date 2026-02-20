import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../services/carrito.service';
import { NotificationService } from '../services/notification.service'; // ← AGREGAR

interface Producto {
  id?: number;
  nombre: string;
  precio: number | null;
  stock: number | null;
  marca: string;
  talla: string;
  imagen: string;
  disponibilidad?: string;
  descripcion?: string;
}

interface Usuario {
  es_admin: boolean;
  username: string;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  templateUrl: './tienda.html',
  styleUrls: ['./tienda.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterLink
  ]
})
export class TiendaComponent implements OnInit {
  apiUrl = 'http://127.0.0.1:8000/api';
  productos: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  
  // Filtros
  filtroNombre: string = '';
  filtroMarca: string = '';
  filtroTalla: string = '';
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;

  cantidadCarrito: number = 0;
  
  // Paginación
  paginaActual: number = 1;
  productosPorPagina: number = 10;
  totalProductos: number = 0;
  totalPaginas: number = 0;
  siguientePagina: string | null = null;
  paginaAnterior: string | null = null;

  indiceInicio = 0;
  indiceFin = 0;
  
  cargando: boolean = false;
  usuario: Usuario | null = null;

  // Opciones disponibles
  marcasDisponibles: string[] = [
    'Nike', 'Adidas', 'Puma', 'Reebok', 'Converse', 
    'Vans', 'New Balance', 'Asics', 'Under Armour'
  ];
  
  tallasDisponibles: string[] = [
    '35', '36', '37', '38', '39', '40', 
    '41', '42', '43', '44', '45'
  ];

  productoForm: Producto = {
    nombre: '',
    precio: null,
    stock: null,
    marca: 'Nike',
    talla: '40',
    imagen: '',
    descripcion: ''
  };

  selectedFile: File | null = null;
  
  Math = Math;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService // ← AGREGAR
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuarioActual();
    this.cargarProductos();

    this.carritoService.carrito$.subscribe(productos => {
      this.cantidadCarrito = productos.reduce((total, p) => total + p.cantidad, 0);
      this.cdr.detectChanges();
    });
    
    // Cargar cantidad inicial del carrito
    const carritoActual = this.carritoService.obtenerCarrito();
    this.cantidadCarrito = carritoActual.reduce((total, p) => total + p.cantidad, 0);
  }

  logout() {
    this.authService.logout();
    this.usuario = null;
    this.notificationService.info('Has cerrado sesión'); // ← CAMBIAR
  }
  
  // Cargar productos con los filtros aplicados
  cargarProductos() {
    console.log('⏳ CARGAR PRODUCTOS LLAMADO');
    this.cargando = true;

    let params: any = {}; 

    const nombreTrim = this.filtroNombre?.trim();
    const marcaTrim = this.filtroMarca?.trim();
    const tallaTrim = this.filtroTalla?.trim();

    if (nombreTrim) params.search = nombreTrim;
    if (marcaTrim) params.marca = marcaTrim;
    if (tallaTrim) params.talla = tallaTrim;
    if (this.filtroPrecioMin != null) params.precio_min = this.filtroPrecioMin;
    if (this.filtroPrecioMax != null) params.precio_max = this.filtroPrecioMax;

    params.page = this.paginaActual || 1;
    params.page_size = this.productosPorPagina;

    console.log('📤 Params enviados al backend:', params);

    this.http.get<any>(`${this.apiUrl}/productos/`, { params }).subscribe({
      next: (res) => {
        console.log('📥 Respuesta del backend:', res);
        this.productos = res.results || res;
        this.totalProductos = res.count || this.productos.length;
        this.totalPaginas = Math.ceil(this.totalProductos / this.productosPorPagina);
        this.siguientePagina = res.next;
        this.paginaAnterior = res.previous;

        this.indiceInicio = (this.paginaActual - 1) * this.productosPorPagina;
        this.indiceFin = Math.min(this.paginaActual * this.productosPorPagina, this.totalProductos);

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar productos', err);
        this.notificationService.error('Error al cargar productos'); // ← AGREGAR
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Aplicar filtros
  aplicarFiltros() {
    console.log('🔍 APLICAR FILTROS LLAMADO');
    this.paginaActual = 1;
    this.cargarProductos();
  }

  // Limpiar todos los filtros
  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroMarca = '';
    this.filtroTalla = '';
    this.filtroPrecioMin = null;
    this.filtroPrecioMax = null;
    this.paginaActual = 1;
    this.cargarProductos();
    this.notificationService.info('Filtros limpiados'); // ← AGREGAR
  }

  // Navegación de paginación
  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarProductos();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  paginaSiguiente() {
    if (this.siguientePagina) {
      this.irAPagina(this.paginaActual + 1);
    }
  }

  paginaAnteriorNav() {
    if (this.paginaAnterior) {
      this.irAPagina(this.paginaActual - 1);
    }
  }

  obtenerPaginas(): number[] {
    const paginas: number[] = [];
    const rango = 2;
    
    for (let i = Math.max(1, this.paginaActual - rango); 
         i <= Math.min(this.totalPaginas, this.paginaActual + rango); 
         i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  // Ver detalle del producto
  verDetalle(producto: Producto) {
    console.log('👁️ Ver detalle clickeado:', producto.nombre);
    
    if (this.productoSeleccionado?.id === producto.id) {
      this.productoSeleccionado = null;
      console.log('Producto deseleccionado');
    } else {
      this.productoSeleccionado = producto;
      console.log('Producto seleccionado:', producto.nombre);
    }
    
    this.cdr.detectChanges();
  }

  // Añadir producto al carrito
  agregarAlCarrito(producto: Producto, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!producto.id) return;

    this.carritoService.agregarProducto({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio ?? 0,
      imagen: producto.imagen,
      cantidad: 1
    });

    this.notificationService.success(`✓ ${producto.nombre} añadido al carrito`); // ← CAMBIAR
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  guardarProducto() {
    const token = this.authService.obtenerToken();
    if (!token) {
      this.notificationService.error('Debes iniciar sesión como administrador'); // ← CAMBIAR
      return;
    }

    const headers = this.authService.obtenerCabeceraAuth();
    const formData = new FormData();
    
    formData.append('nombre', this.productoForm.nombre ?? '');
    formData.append('descripcion', this.productoForm.descripcion ?? '');
    formData.append('precio', String(this.productoForm.precio ?? 0));
    formData.append('stock', String(this.productoForm.stock ?? 0));
    formData.append('marca', this.productoForm.marca ?? 'Nike');
    formData.append('talla', this.productoForm.talla ?? '40');

    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }

    if (this.productoForm.id) {
      // Actualizar producto existente
      this.http.put(`${this.apiUrl}/productos/${this.productoForm.id}/`, formData, { headers }).subscribe({
        next: () => {
          this.notificationService.success('✓ Producto actualizado correctamente'); // ← CAMBIAR
          this.limpiarFormulario();
          this.productoSeleccionado = null;
          this.cargarProductos();
        },
        error: (err) => {
          console.error('Error al actualizar producto:', err);
          if (err.status === 403) {
            this.notificationService.error('No tienes permisos de administrador'); // ← CAMBIAR
          } else {
            this.notificationService.error('Error al actualizar producto'); // ← CAMBIAR
          }
        }
      });
    } else {
      // Crear producto nuevo
      this.http.post(`${this.apiUrl}/productos/`, formData, { headers }).subscribe({
        next: (res: any) => {
          this.productos.push(res);
          this.limpiarFormulario();
          this.cargarProductos();
          this.notificationService.success('✓ Producto agregado correctamente'); // ← CAMBIAR
        },
        error: (err) => {
          console.error('Error al crear producto:', err);
          if (err.status === 403) {
            this.notificationService.error('No tienes permisos de administrador'); // ← CAMBIAR
          } else if (err.status === 401) {
            this.notificationService.error('Tu sesión ha expirado'); // ← CAMBIAR
          } else {
            this.notificationService.error('Error al crear producto'); // ← CAMBIAR
          }
        }
      });
    }
  }

  // Editar producto
  editarProducto(producto: Producto, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    console.log('✏️ Editando producto:', producto.nombre);
    
    this.productoForm = { ...producto };
    this.productoSeleccionado = producto;
    
    this.cdr.detectChanges();
    
    setTimeout(() => {
      const adminPanel = document.querySelector('section:has(form)');
      if (adminPanel) {
        adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('Scroll realizado al formulario');
      }
    }, 100);
  }

  // Eliminar producto
  eliminarProducto(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

    const headers = this.authService.obtenerCabeceraAuth();

    this.http.delete(`${this.apiUrl}/productos/${id}/`, { headers }).subscribe({
      next: () => {
        this.productos = this.productos.filter((p) => p.id !== id);
        if (this.productoSeleccionado?.id === id) {
          this.productoSeleccionado = null;
        }
        this.limpiarFormulario();
        this.notificationService.success('✓ Producto eliminado correctamente'); // ← CAMBIAR
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar producto', err);
        this.notificationService.error('No se pudo eliminar el producto'); // ← CAMBIAR
      }
    });
  }

  limpiarFormulario() {
    this.productoForm = {
      nombre: '',
      precio: null,
      stock: null,
      marca: 'Nike',
      talla: '40',
      imagen: '',
      descripcion: ''
    };
    this.selectedFile = null;
    this.productoSeleccionado = null;
    this.cdr.detectChanges();
  }
}