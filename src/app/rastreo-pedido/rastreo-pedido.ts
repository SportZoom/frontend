import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, timeout } from 'rxjs';
import { CheckoutService } from '../services/checkout.service';
import { Producto, ProductosService } from '../services/productos.service';

@Component({
  selector: 'app-rastreo-pedido',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rastreo-pedido.html',
})
export class RastreoPedidoComponent implements OnInit {
  pedido: any = null;
  productos: any[] = [];
  codigo = '';
  cargando = true;
  imagenesListas = false;
  error = '';
  estadoActual = 'comprado';

  steps = [
    { key: 'comprado', label: 'Comprado' },
    { key: 'enviado', label: 'Enviado' },
    { key: 'en_reparto', label: 'En reparto' },
    { key: 'entregado', label: 'Entregado' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private checkoutService: CheckoutService,
    private productosService: ProductosService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.codigo = this.route.snapshot.paramMap.get('codigo') || '';
    if (!this.codigo) {
      this.router.navigate(['/mis-pedidos']);
      return;
    }

    this.checkoutService.consultarPedido(this.codigo).subscribe({
      next: (pedido) => {
        console.log('[RastreoPedido] Pedido recibido:', pedido);
        console.log('[RastreoPedido] Carrito crudo:', pedido?.carrito);
        this.pedido = pedido;
        this.estadoActual = this.calcularEstado(pedido.fecha);
        const carrito = this.normalizarCarrito(pedido.carrito);
        console.log('[RastreoPedido] Productos normalizados:', carrito.map(item => ({
          nombre: item?.nombre,
          id: item?.id,
          producto_id: item?.producto_id,
          imagen: item?.imagen,
          item,
        })));
        this.productos = [];
        this.imagenesListas = false;
        this.cargando = false;
        this.cargarImagenesProductos(carrito);
      },
      error: () => {
        this.error = 'No pudimos cargar el rastreo de este pedido.';
        this.cargando = false;
      },
    });
  }

  get estadoIndex(): number {
    return Math.max(0, this.steps.findIndex(step => step.key === this.estadoActual));
  }

  get porcentajeProgreso(): number {
    return this.estadoIndex === 0 ? 0 : (this.estadoIndex / (this.steps.length - 1)) * 100;
  }

  get guia(): string {
    return this.horasDesdePedido() >= 24 ? `COORD-${this.codigo}` : 'En preparación';
  }

  get fechaEstimada(): Date | null {
    if (!this.pedido?.fecha) return null;
    const fecha = new Date(this.pedido.fecha);
    fecha.setHours(fecha.getHours() + 72);
    return fecha;
  }

  stepCompletado(index: number): boolean {
    return index <= this.estadoIndex;
  }

  private calcularEstado(fechaPedido: string): string {
    const horas = this.horasDesdePedido(fechaPedido);
    if (horas >= 72) return 'entregado';
    if (horas >= 48) return 'en_reparto';
    if (horas >= 24) return 'enviado';
    return 'comprado';
  }

  private horasDesdePedido(fechaPedido = this.pedido?.fecha): number {
    if (!fechaPedido) return 0;
    const fecha = new Date(fechaPedido).getTime();
    return Math.max(0, (Date.now() - fecha) / (1000 * 60 * 60));
  }

  private normalizarCarrito(carrito: unknown): any[] {
    if (Array.isArray(carrito)) {
      return carrito.map(item => this.normalizarProductoCarrito(item));
    }
    if (typeof carrito === 'string') {
      try {
        const parsed = JSON.parse(carrito);
        return Array.isArray(parsed) ? parsed.map(item => this.normalizarProductoCarrito(item)) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private normalizarProductoCarrito(item: any): any {
    return {
      ...item,
      imagen: this.obtenerImagen(item),
      producto_id: item?.producto_id || item?.productoId || item?.producto?.id || item?.id,
    };
  }

  private obtenerImagen(item: any): string {
    return item?.imagen || item?.imagen_url || item?.image || item?.producto?.imagen || item?.producto?.imagen_url || '';
  }

  private obtenerIdProducto(item: any): number | null {
    const id = item?.producto_id || item?.productoId || item?.producto?.id || item?.id;
    const idNumerico = Number(id);
    return Number.isFinite(idNumerico) && idNumerico > 0 ? idNumerico : null;
  }

  private extraerProductosRespuesta(respuesta: any): Producto[] {
    if (Array.isArray(respuesta)) return respuesta;
    if (Array.isArray(respuesta?.results)) return respuesta.results;
    if (Array.isArray(respuesta?.productos)) return respuesta.productos;
    if (Array.isArray(respuesta?.data)) return respuesta.data;
    return [];
  }

  private buscarImagenPorNombre(item: any) {
    const nombre = String(item?.nombre || '').trim();
    if (!nombre) return of(item);

    return this.productosService.obtenerProductos({ nombre }).pipe(
      timeout(5000),
      map((respuesta) => {
        const productos = this.extraerProductosRespuesta(respuesta);
        const encontrado = productos.find(producto => producto.nombre?.trim().toLowerCase() === nombre.toLowerCase());
        const imagen = encontrado ? this.obtenerImagen(encontrado) : '';
        console.log('[RastreoPedido] Busqueda por nombre:', {
          nombre,
          encontrado,
          imagen,
        });
        return {
          ...item,
          imagen: imagen || this.obtenerImagen(item),
        };
      }),
      catchError((error) => {
        console.warn('[RastreoPedido] No se pudo buscar imagen por nombre:', nombre, error);
        return of(item);
      })
    );
  }

  private cargarImagenesProductos(items: any[]) {
    if (!items.length) {
      this.productos = [];
      this.imagenesListas = true;
      this.cdr.detectChanges();
      return;
    }

    const consultas = items.map(item => {
      const imagenExistente = this.obtenerImagen(item);
      if (imagenExistente) return of({ ...item, imagen: imagenExistente });
      const productoId = this.obtenerIdProducto(item);
      if (!productoId) return this.buscarImagenPorNombre(item);

      return this.productosService.obtenerProductoPorId(productoId).pipe(
        timeout(5000),
        map((producto: Producto) => ({
          ...item,
          imagen: this.obtenerImagen(producto),
        })),
        catchError((error) => {
          console.warn('[RastreoPedido] No se pudo obtener producto por id, intento por nombre:', {
            productoId,
            item,
            error,
          });
          return this.buscarImagenPorNombre(item);
        })
      );
    });

    forkJoin(consultas).subscribe({
      next: (productos) => {
        console.log('[RastreoPedido] Productos finales para render:', productos.map(item => ({
          nombre: item?.nombre,
          id: item?.id,
          producto_id: item?.producto_id,
          imagen: item?.imagen,
          item,
        })));
        this.productos = productos;
        this.imagenesListas = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.productos = items;
        this.imagenesListas = true;
        this.cdr.detectChanges();
      },
    });
  }
}
