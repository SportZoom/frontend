import { TestBed } from '@angular/core/testing';
import { CarritoService } from './carrito.service';

interface ProductoCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

describe('CarritoService', () => {
  let service: CarritoService;

  const producto1: ProductoCarrito = {
    id: 1,
    nombre: 'Zapatilla Nike',
    precio: 150,
    cantidad: 1,
    imagen: 'nike.jpg'
  };

  const producto2: ProductoCarrito = {
    id: 2,
    nombre: 'Zapatilla Adidas',
    precio: 200,
    cantidad: 1,
    imagen: 'adidas.jpg'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CarritoService]
    });
    service = TestBed.inject(CarritoService);
    localStorage.clear();
    service.limpiarCarrito();
  });

  describe('agregarProducto', () => {
    it('should add new product to cart', () => {
      service.agregarProducto(producto1);

      const carrito = service.obtenerCarrito();
      expect(carrito.length).toBe(1);
      expect(carrito[0].nombre).toBe('Zapatilla Nike');
      expect(carrito[0].cantidad).toBe(1);
    });

    it('should increase quantity when product already exists', () => {
      service.agregarProducto(producto1);
      service.agregarProducto(producto1);

      const carrito = service.obtenerCarrito();
      expect(carrito.length).toBe(1);
      expect(carrito[0].cantidad).toBe(2);
    });

    it('should add different products separately', () => {
      service.agregarProducto(producto1);
      service.agregarProducto(producto2);

      const carrito = service.obtenerCarrito();
      expect(carrito.length).toBe(2);
    });

    it('should persist cart to localStorage', () => {
      service.agregarProducto(producto1);

      const stored = localStorage.getItem('carrito');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!).length).toBe(1);
    });

    it('should emit new value through observable', (done) => {
      service.carrito$.subscribe(productos => {
        if (productos.length > 0) {
          expect(productos[0].nombre).toBe('Zapatilla Nike');
          done();
        }
      });
      service.agregarProducto(producto1);
    });
  });

  describe('aumentarCantidad', () => {
    it('should increase product quantity by 1', () => {
      service.agregarProducto(producto1);
      expect(service.obtenerCarrito()[0].cantidad).toBe(1);

      service.aumentarCantidad(1);
      expect(service.obtenerCarrito()[0].cantidad).toBe(2);

      service.aumentarCantidad(1);
      expect(service.obtenerCarrito()[0].cantidad).toBe(3);
    });

    it('should not affect non-existent product', () => {
      service.agregarProducto(producto1);
      const initialLength = service.obtenerCarrito().length;

      service.aumentarCantidad(999);
      expect(service.obtenerCarrito().length).toBe(initialLength);
    });

    it('should persist updated quantity to localStorage', () => {
      service.agregarProducto(producto1);
      service.aumentarCantidad(1);

      const stored = JSON.parse(localStorage.getItem('carrito')!);
      expect(stored[0].cantidad).toBe(2);
    });
  });

  describe('disminuirCantidad', () => {
    it('should decrease product quantity by 1', () => {
      service.agregarProducto(producto1);
      service.aumentarCantidad(1);
      expect(service.obtenerCarrito()[0].cantidad).toBe(2);

      service.disminuirCantidad(1);
      expect(service.obtenerCarrito()[0].cantidad).toBe(1);
    });

    it('should remove product when quantity reaches 0', () => {
      service.agregarProducto(producto1);
      expect(service.obtenerCarrito().length).toBe(1);

      service.disminuirCantidad(1);
      expect(service.obtenerCarrito().length).toBe(0);
    });

    it('should not go below 0 when decreasing', () => {
      service.agregarProducto(producto1);
      service.disminuirCantidad(1);
      service.disminuirCantidad(1);
      expect(service.obtenerCarrito().length).toBe(0);
    });

    it('should not affect non-existent product', () => {
      service.agregarProducto(producto1);
      service.disminuirCantidad(999);
      expect(service.obtenerCarrito()[0].cantidad).toBe(1);
    });
  });

  describe('eliminarProducto', () => {
    it('should remove product from cart by id', () => {
      service.agregarProducto(producto1);
      service.agregarProducto(producto2);
      expect(service.obtenerCarrito().length).toBe(2);

      service.eliminarProducto(1);
      expect(service.obtenerCarrito().length).toBe(1);
      expect(service.obtenerCarrito()[0].id).toBe(2);
    });

    it('should update localStorage after removal', () => {
      service.agregarProducto(producto1);
      service.agregarProducto(producto2);
      service.eliminarProducto(1);

      const stored = JSON.parse(localStorage.getItem('carrito')!);
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe(2);
    });
  });

  describe('obtenerCarrito', () => {
    it('should return empty array when cart is empty', () => {
      expect(service.obtenerCarrito()).toEqual([]);
    });

    it('should return current cart items', () => {
      service.agregarProducto(producto1);
      service.agregarProducto(producto2);

      const carrito = service.obtenerCarrito();
      expect(carrito.length).toBe(2);
    });

    it('should load cart from localStorage', () => {
      localStorage.setItem('carrito', JSON.stringify([producto1, producto2]));

      const carrito = service.obtenerCarrito();
      expect(carrito.length).toBe(2);
    });
  });

  describe('limpiarCarrito', () => {
    it('should remove all products from cart', () => {
      service.agregarProducto(producto1);
      service.agregarProducto(producto2);
      expect(service.obtenerCarrito().length).toBe(2);

      service.limpiarCarrito();
      expect(service.obtenerCarrito().length).toBe(0);
    });

    it('should clear localStorage', () => {
      service.agregarProducto(producto1);
      service.limpiarCarrito();

      expect(localStorage.getItem('carrito')).toBeNull();
    });

    it('should emit empty array through observable', (done) => {
      service.agregarProducto(producto1);
      service.carrito$.subscribe(productos => {
        if (productos.length === 0) {
          done();
        }
      });
      service.limpiarCarrito();
    });
  });

  describe('calcularTotal', () => {
    it('should return 0 for empty cart', () => {
      expect(service.calcularTotal()).toBe(0);
    });

    it('should calculate total correctly', () => {
      service.agregarProducto(producto1);
      service.agregarProducto(producto1);
      service.agregarProducto(producto2);
      service.agregarProducto(producto2);
      service.agregarProducto(producto2);

      const total = service.calcularTotal();
      expect(total).toBe(2 * 150 + 3 * 200);
    });

    it('should multiply price by quantity', () => {
      service.agregarProducto(producto1);
      service.agregarProducto(producto1);
      service.agregarProducto(producto1);
      service.agregarProducto(producto1);
      service.agregarProducto(producto1);
      expect(service.calcularTotal()).toBe(150 * 5);
    });
  });
});
