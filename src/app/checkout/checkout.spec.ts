import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CheckoutComponent } from './checkout';
import { CheckoutService } from '../services/checkout.service';
import { CarritoService } from '../services/carrito.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let httpMock: HttpTestingController;
  let checkoutService: CheckoutService;
  let carritoService: CarritoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        CheckoutService,
        CarritoService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    checkoutService = TestBed.inject(CheckoutService);
    carritoService = TestBed.inject(CarritoService);

    localStorage.clear();
    carritoService.limpiarCarrito();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty datos initially', () => {
      expect(component.datos.nombre).toBe('');
      expect(component.datos.email).toBe('');
      expect(component.datos.direccion).toBe('');
    });

    it('should have cargando as false', () => {
      expect(component.cargando).toBeFalse();
    });

    it('should have empty error message', () => {
      expect(component.error).toBe('');
    });
  });

  describe('pagar validation', () => {
    it('should show error when direccion is empty', () => {
      component.datos.direccion = '';
      component.pagar();
      expect(component.error).toBe('La dirección de envío es obligatoria.');
    });

    it('should show error when direccion is only whitespace', () => {
      component.datos.direccion = '   ';
      component.pagar();
      expect(component.error).toBe('La dirección de envío es obligatoria.');
    });
  });

  describe('datos structure', () => {
    it('should have all required fields in datos', () => {
      expect(component.datos).toBeDefined();
      expect(component.datos.nombre).toBeDefined();
      expect(component.datos.email).toBeDefined();
      expect(component.datos.direccion).toBeDefined();
      expect(component.datos.subtotal).toBeDefined();
      expect(component.datos.iva).toBeDefined();
      expect(component.datos.total).toBeDefined();
    });
  });
});
