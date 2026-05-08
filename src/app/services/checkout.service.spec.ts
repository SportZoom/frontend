import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CheckoutService]
    });
    service = TestBed.inject(CheckoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('confirmarPago', () => {
    it('should POST to /api/checkout/pago/ with payload', () => {
      const payload = {
        numero_pedido: 'PED-123',
        total: 50000,
        nombre: 'Juan Perez',
        email: 'juan@test.com',
        direccion: 'Calle 123'
      };
      const mockResponse = { success: true, pedido_id: 1 };

      service.confirmarPago(payload).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/checkout/pago/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('should handle confirmation error', () => {
      const payload = { numero_pedido: 'INVALID' };

      service.confirmarPago(payload).subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/checkout/pago/');
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('consultarPedido', () => {
    it('should GET pedido by numero', () => {
      const numeroPedido = 'PED-456';
      const mockPedido = {
        id: 1,
        numero_pedido: numeroPedido,
        total: 75000,
        estado: 'pendiente'
      };

      service.consultarPedido(numeroPedido).subscribe(pedido => {
        expect(pedido).toEqual(mockPedido);
      });

      const req = httpMock.expectOne(`/api/pedidos/consultar/${numeroPedido}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPedido);
    });

    it('should handle not found error', () => {
      service.consultarPedido('INVALID-PED').subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('/api/pedidos/consultar/INVALID-PED/');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('crearPreferenciaMP', () => {
    it('should POST to create Mercado Pago preference', () => {
      const numeroPedido = 'PED-789';
      const mockResponse = {
        sandbox_init_point: 'https://sandbox.mercadopago.com/init',
        init_point: 'https://mercadopago.com/init'
      };

      service.crearPreferenciaMP(numeroPedido).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/pagos/crear-preferencia/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ numero_pedido: numeroPedido });
      req.flush(mockResponse);
    });

    it('should handle Mercado Pago error', () => {
      service.crearPreferenciaMP('PED-ERR').subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/pagos/crear-preferencia/');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('aprobarPagoDemo', () => {
    it('should POST to approve demo payment', () => {
      const numeroPedido = 'PED-DEMO';
      const mockResponse = {
        payment_id: 'MP-12345',
        status: 'approved'
      };

      service.aprobarPagoDemo(numeroPedido).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`/api/pagos/demo-aprobado/${numeroPedido}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('estadoPagoMP', () => {
    it('should GET payment status by order number', () => {
      const numeroPedido = 'PED-STATUS';
      const mockStatus = {
        status: 'approved',
        payment_id: 'MP-999',
        amount: 50000
      };

      service.estadoPagoMP(numeroPedido).subscribe(status => {
        expect(status).toEqual(mockStatus);
      });

      const req = httpMock.expectOne(`/api/pagos/estado/${numeroPedido}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStatus);
    });
  });
});
