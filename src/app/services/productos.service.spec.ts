import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductosService, Producto, FiltrosProducto } from './productos.service';

describe('ProductosService', () => {
  let service: ProductosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductosService]
    });
    service = TestBed.inject(ProductosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('obtenerProductos', () => {
    it('should return products array', () => {
      const mockProducts: Producto[] = [
        { id: 1, nombre: 'Zapatilla Nike', precio: 150, stock: 10, marca: 'Nike', talla: '40', imagen: 'nike.jpg' },
        { id: 2, nombre: 'Zapatilla Adidas', precio: 180, stock: 5, marca: 'Adidas', talla: '41', imagen: 'adidas.jpg' }
      ];

      service.obtenerProductos().subscribe(productos => {
        expect(productos).toEqual(mockProducts);
      });

      const req = httpMock.expectOne('/api/productos/');
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should send filters as query params', () => {
      const filtros: FiltrosProducto = {
        nombre: 'zapatilla',
        marca: 'Nike',
        talla: '40',
        precioMin: 100,
        precioMax: 200
      };

      service.obtenerProductos(filtros).subscribe();

      const req = httpMock.expectOne(req => {
        const url = req.urlWithParams;
        return url.includes('search=zapatilla') &&
               url.includes('marca=Nike') &&
               url.includes('talla=40') &&
               url.includes('precio_min=100') &&
               url.includes('precio_max=200');
      });
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle partial filters', () => {
      const filtros: FiltrosProducto = {
        nombre: 'zapatilla'
      };

      service.obtenerProductos(filtros).subscribe();

      const req = httpMock.expectOne(req => req.urlWithParams.includes('search=zapatilla'));
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should not add filter params when undefined', () => {
      const filtros: FiltrosProducto = {
        precioMin: null,
        precioMax: undefined
      };

      service.obtenerProductos(filtros).subscribe();

      const req = httpMock.expectOne('/api/productos/');
      expect(req.request.params.keys().length).toBe(0);
      req.flush([]);
    });
  });

  describe('obtenerProductoPorId', () => {
    it('should return single product by id', () => {
      const mockProduct: Producto = {
        id: 5,
        nombre: 'Zapatilla Puma',
        precio: 120,
        stock: 8,
        marca: 'Puma',
        talla: '42',
        imagen: 'puma.jpg'
      };

      service.obtenerProductoPorId(5).subscribe(producto => {
        expect(producto).toEqual(mockProduct);
      });

      const req = httpMock.expectOne('/api/productos/5/');
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('should handle not found', () => {
      service.obtenerProductoPorId(999).subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('/api/productos/999/');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('crearProducto', () => {
    it('should POST formData to create product', () => {
      const formData = new FormData();
      formData.append('nombre', 'Nuevo Producto');
      formData.append('precio', '100');
      const headers = { 'Authorization': 'Bearer token' };

      const mockResponse: Producto = {
        id: 10,
        nombre: 'Nuevo Producto',
        precio: 100,
        stock: 0,
        marca: 'Nike',
        talla: '40',
        imagen: ''
      };

      service.crearProducto(formData, headers).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/productos/');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should send custom headers', () => {
      const formData = new FormData();
      const headers = { 'Authorization': 'Bearer admin-token' };

      service.crearProducto(formData, headers).subscribe();

      const req = httpMock.expectOne('/api/productos/');
      expect(req.request.headers.get('Authorization')).toBe('Bearer admin-token');
      req.flush({});
    });
  });

  describe('actualizarProducto', () => {
    it('should PUT formData to update product', () => {
      const id = 5;
      const formData = new FormData();
      formData.append('nombre', 'Producto Actualizado');
      const headers = { 'Authorization': 'Bearer token' };

      const mockResponse: Producto = {
        id: 5,
        nombre: 'Producto Actualizado',
        precio: 150,
        stock: 10,
        marca: 'Nike',
        talla: '40',
        imagen: ''
      };

      service.actualizarProducto(id, formData, headers).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/productos/5/');
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('eliminarProducto', () => {
    it('should DELETE product by id', () => {
      const id = 3;
      const headers = { 'Authorization': 'Bearer token' };

      service.eliminarProducto(id, headers).subscribe();

      const req = httpMock.expectOne('/api/productos/3/');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle unauthorized error', () => {
      service.eliminarProducto(3, {}).subscribe({
        error: (err) => {
          expect(err.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('/api/productos/3/');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('obtenerMarcasDisponibles', () => {
    it('should return list of available brands', () => {
      const marcas = service.obtenerMarcasDisponibles();
      
      expect(marcas).toContain('Nike');
      expect(marcas).toContain('Adidas');
      expect(marcas).toContain('Puma');
      expect(marcas.length).toBe(9);
    });
  });

  describe('obtenerTallasDisponibles', () => {
    it('should return list of available sizes', () => {
      const tallas = service.obtenerTallasDisponibles();
      
      expect(tallas).toContain('40');
      expect(tallas).toContain('41');
      expect(tallas.length).toBe(11);
    });

    it('should have sizes from 35 to 45', () => {
      const tallas = service.obtenerTallasDisponibles();
      expect(tallas[0]).toBe('35');
      expect(tallas[tallas.length - 1]).toBe('45');
    });
  });
});
