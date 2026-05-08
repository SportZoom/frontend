import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PagoComponent } from './pago';
import { CheckoutService } from '../services/checkout.service';

describe('PagoComponent', () => {
  let component: PagoComponent;
  let fixture: ComponentFixture<PagoComponent>;
  let checkoutService: CheckoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [CheckoutService]
    }).compileComponents();

    fixture = TestBed.createComponent(PagoComponent);
    component = fixture.componentInstance;
    checkoutService = TestBed.inject(CheckoutService);

    localStorage.clear();
    localStorage.setItem('pedido_mp', 'PED-TEST-456');
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty error message', () => {
      expect(component.error).toBe('');
    });

    it('should have cargando as false initially', () => {
      expect(component.cargando).toBeFalse();
    });

    it('should have empty tarjeta object', () => {
      expect(component.tarjeta.numero).toBe('');
      expect(component.tarjeta.titular).toBe('');
      expect(component.tarjeta.vencimiento).toBe('');
      expect(component.tarjeta.cvv).toBe('');
      expect(component.tarjeta.documento).toBe('');
    });
  });

  describe('numeroTarjetaFormateado', () => {
    it('should format card number with spaces every 4 digits', () => {
      component.tarjeta.numero = '1234567890123456';
      expect(component.numeroTarjetaFormateado).toBe('1234 5678 9012 3456');
    });

    it('should handle empty card number', () => {
      component.tarjeta.numero = '';
      expect(component.numeroTarjetaFormateado).toBe('');
    });

    it('should remove non-digit characters', () => {
      component.tarjeta.numero = '1234abcd5678efgh9012';
      expect(component.numeroTarjetaFormateado).toBe('1234 5678 9012');
    });
  });

  describe('actualizarNumeroTarjeta', () => {
    it('should keep only digits', () => {
      component.actualizarNumeroTarjeta('1234abcd5678');
      expect(component.tarjeta.numero).toBe('12345678');
    });

    it('should limit to 16 digits', () => {
      component.actualizarNumeroTarjeta('12345678901234567890');
      expect(component.tarjeta.numero).toBe('1234567890123456');
    });

    it('should handle empty input', () => {
      component.actualizarNumeroTarjeta('');
      expect(component.tarjeta.numero).toBe('');
    });
  });

  describe('actualizarVencimiento', () => {
    it('should format MM/YY', () => {
      component.actualizarVencimiento('1225');
      expect(component.tarjeta.vencimiento).toBe('12/25');
    });

    it('should handle single month digit', () => {
      component.actualizarVencimiento('1');
      expect(component.tarjeta.vencimiento).toBe('1');
    });

    it('should limit to 4 digits', () => {
      component.actualizarVencimiento('123456');
      expect(component.tarjeta.vencimiento.length).toBeLessThanOrEqual(5);
    });
  });

  describe('confirmarPago', () => {
    it('should show error when form is invalid', () => {
      component.confirmarPago();
      expect(component.error).toBe('Revisa los datos de pago antes de continuar.');
    });
  });
});
