import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login';
import { AuthService } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have cliente tab active by default', () => {
    expect(component.pestanaActiva).toBe('cliente');
  });

  it('should switch tabs', () => {
    component.cambiarPestana('admin');
    expect(component.pestanaActiva).toBe('admin');

    component.cambiarPestana('cliente');
    expect(component.pestanaActiva).toBe('cliente');
  });

  it('should clear error message when switching tabs', () => {
    component.errorMsg = 'Some error';
    component.cambiarPestana('admin');
    expect(component.errorMsg).toBe('');
  });

  describe('cliente login validation', () => {
    it('should show error when email is empty', () => {
      component.correo = '';
      component.passwordCliente = 'password123';
      component.pestanaActiva = 'cliente';

      component.iniciarSesion();
      expect(component.errorMsg).toBe('Por favor, ingresa tu correo y contraseña.');
    });

    it('should show error when password is empty', () => {
      component.correo = 'test@test.com';
      component.passwordCliente = '';
      component.pestanaActiva = 'cliente';

      component.iniciarSesion();
      expect(component.errorMsg).toBe('Por favor, ingresa tu correo y contraseña.');
    });
  });

  describe('admin login validation', () => {
    it('should show error when username is empty for admin', () => {
      component.username = '';
      component.passwordAdmin = 'password123';
      component.pestanaActiva = 'admin';

      component.iniciarSesion();
      expect(component.errorMsg).toBe('Por favor, ingresa usuario y contraseña.');
    });
  });

  describe('initial state', () => {
    it('should have empty initial values', () => {
      expect(component.correo).toBe('');
      expect(component.passwordCliente).toBe('');
      expect(component.username).toBe('');
      expect(component.passwordAdmin).toBe('');
      expect(component.cargando).toBeFalse();
      expect(component.errorMsg).toBe('');
    });
  });
});
