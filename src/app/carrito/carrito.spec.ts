import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CarritoComponent } from './carrito';
import { CarritoService } from '../services/carrito.service';
import { NotificationService } from '../services/notification.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

describe('CarritoComponent', () => {
  let component: CarritoComponent;
  let fixture: ComponentFixture<CarritoComponent>;
  let httpMock: HttpTestingController;
  let carritoService: CarritoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarritoComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        CarritoService,
        NotificationService,
        ConfirmDialogService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarritoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    carritoService = TestBed.inject(CarritoService);
    
    localStorage.clear();
    carritoService.limpiarCarrito();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    carritoService.limpiarCarrito();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty productos', () => {
    expect(component.productos).toBeDefined();
  });

  describe('total calculation', () => {
    it('should return 0 for empty cart', () => {
      expect(component.total).toBe(0);
    });
  });

  describe('eliminar', () => {
    it('should call eliminarProducto from service', () => {
      const spy = spyOn(carritoService, 'eliminarProducto').and.callThrough();
      component.eliminar(1);
      expect(spy).toHaveBeenCalledWith(1);
    });
  });

  describe('aumentarCantidad', () => {
    it('should call aumentarCantidad from service', () => {
      const spy = spyOn(carritoService, 'aumentarCantidad').and.callThrough();
      component.aumentarCantidad(1);
      expect(spy).toHaveBeenCalledWith(1);
    });
  });

  describe('disminuirCantidad', () => {
    it('should call disminuirCantidad from service', () => {
      const spy = spyOn(carritoService, 'disminuirCantidad').and.callThrough();
      component.disminuirCantidad(1);
      expect(spy).toHaveBeenCalledWith(1);
    });
  });
});
