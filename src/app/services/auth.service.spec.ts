import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should call POST /api/token/ with username and password', () => {
      const mockResponse = { access: 'test-token-123' };
      const username = 'admin';
      const password = 'password123';

      service.login(username, password).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/token/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const username = 'invalid';
      const password = 'wrong';

      service.login(username, password).subscribe({
        error: (err) => {
          expect(err.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('/api/token/');
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('guardarToken', () => {
    it('should save token to localStorage', () => {
      const token = 'my-secret-token';
      service.guardarToken(token);
      expect(localStorage.getItem('token')).toBe(token);
    });
  });

  describe('obtenerToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'stored-token');
      expect(service.obtenerToken()).toBe('stored-token');
    });

    it('should return null when no token exists', () => {
      localStorage.removeItem('token');
      expect(service.obtenerToken()).toBeNull();
    });
  });

  describe('obtenerUsuarioActual', () => {
    it('should return parsed user object from localStorage', () => {
      const userObj = { nombre: 'Juan', correo: 'juan@test.com', es_admin: false };
      localStorage.setItem('usuario', JSON.stringify(userObj));
      
      const result = service.obtenerUsuarioActual();
      expect(result).toEqual(userObj);
    });

    it('should return null when no user in localStorage', () => {
      localStorage.removeItem('usuario');
      expect(service.obtenerUsuarioActual()).toBeNull();
    });
  });

  describe('obtenerCabeceraAuth', () => {
    it('should return HttpHeaders with Bearer token', () => {
      localStorage.setItem('token', 'bearer-token');
      const headers = service.obtenerCabeceraAuth();
      expect(headers.get('Authorization')).toBe('Bearer bearer-token');
    });

    it('should return empty Authorization header when no token', () => {
      localStorage.removeItem('token');
      const headers = service.obtenerCabeceraAuth();
      expect(headers.get('Authorization')).toBe('');
    });
  });

  describe('logout', () => {
    it('should remove token and usuario from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('usuario', JSON.stringify({ nombre: 'Test' }));

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('usuario')).toBeNull();
    });
  });

  describe('loginCliente', () => {
    it('should call POST /api/clientes/login/ with correo and password', () => {
      const mockResponse = {
        access: 'client-access-token',
        nombre: 'Cliente Test',
        correo: 'cliente@test.com'
      };
      const correo = 'cliente@test.com';
      const password = 'clientpass';

      service.loginCliente(correo, password).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/clientes/login/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ correo, password });
      req.flush(mockResponse);
    });

    it('should handle client login error', () => {
      service.loginCliente('invalid@test.com', 'wrong').subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/clientes/login/');
      req.flush('Invalid credentials', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('guardarSesionCliente', () => {
    it('should save client session with token and user data', () => {
      const response = {
        access: 'client-token-xyz',
        nombre: 'Maria Garcia',
        correo: 'maria@email.com'
      };

      service.guardarSesionCliente(response);

      expect(localStorage.getItem('token')).toBe('client-token-xyz');
      const savedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
      expect(savedUser.nombre).toBe('Maria Garcia');
      expect(savedUser.correo).toBe('maria@email.com');
      expect(savedUser.es_admin).toBeFalse();
    });
  });
});
