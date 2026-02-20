import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
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

export interface FiltrosProducto {
  nombre?: string;
  marca?: string;
  talla?: string;
  precioMin?: number | null;
  precioMax?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private apiUrl = 'http://127.0.0.1:8000/api/productos/';

  constructor(private http: HttpClient) {}

  /**
   * Obtener productos con filtros opcionales
   */
  obtenerProductos(filtros?: FiltrosProducto): Observable<any> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.nombre) {
        params = params.set('search', filtros.nombre);
      }
      if (filtros.marca) {
        params = params.set('marca', filtros.marca);
      }
      if (filtros.talla) {
        params = params.set('talla', filtros.talla);
      }
      if (filtros.precioMin !== null && filtros.precioMin !== undefined) {
        params = params.set('precio_min', filtros.precioMin.toString());
      }
      if (filtros.precioMax !== null && filtros.precioMax !== undefined) {
        params = params.set('precio_max', filtros.precioMax.toString());
      }
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtener un producto por ID
   */
  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}${id}/`);
  }

  /**
   * Crear un nuevo producto (requiere autenticación admin)
   */
  crearProducto(formData: FormData, headers: any): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, formData, { headers });
  }

  /**
   * Actualizar un producto existente (requiere autenticación admin)
   */
  actualizarProducto(id: number, formData: FormData, headers: any): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}${id}/`, formData, { headers });
  }

  /**
   * Eliminar un producto (requiere autenticación admin)
   */
  eliminarProducto(id: number, headers: any): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers });
  }

  /**
   * Obtener marcas disponibles
   */
  obtenerMarcasDisponibles(): string[] {
    return [
      'Nike', 'Adidas', 'Puma', 'Reebok', 'Converse',
      'Vans', 'New Balance', 'Asics', 'Under Armour'
    ];
  }

  /**
   * Obtener tallas disponibles
   */
  obtenerTallasDisponibles(): string[] {
    return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  }
}