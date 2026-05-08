import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('adminGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [AuthService]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('should return true when user is admin', () => {
    spyOn(authService, 'obtenerUsuarioActual').and.returnValue({
      nombre: 'Admin User',
      correo: 'admin@test.com',
      es_admin: true
    });

    TestBed.runInInjectionContext(() => {
      const result = adminGuard();
      expect(result).toBeTrue();
    });
  });

  it('should return false and navigate to /login when user is not admin', () => {
    spyOn(authService, 'obtenerUsuarioActual').and.returnValue({
      nombre: 'Regular User',
      correo: 'user@test.com',
      es_admin: false
    });
    const navigateSpy = spyOn(router, 'navigate');

    TestBed.runInInjectionContext(() => {
      const result = adminGuard();
      expect(result).toBeFalse();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  it('should return false and navigate to /login when user is null', () => {
    spyOn(authService, 'obtenerUsuarioActual').and.returnValue(null);
    const navigateSpy = spyOn(router, 'navigate');

    TestBed.runInInjectionContext(() => {
      const result = adminGuard();
      expect(result).toBeFalse();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  it('should return false and navigate when usuario object has no es_admin', () => {
    spyOn(authService, 'obtenerUsuarioActual').and.returnValue({
      nombre: 'Test User'
    } as any);
    const navigateSpy = spyOn(router, 'navigate');

    TestBed.runInInjectionContext(() => {
      const result = adminGuard();
      expect(result).toBeFalse();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  it('should check es_admin property correctly', () => {
    spyOn(authService, 'obtenerUsuarioActual').and.returnValue({
      nombre: 'Admin',
      es_admin: true
    });

    TestBed.runInInjectionContext(() => {
      expect(adminGuard()).toBeTrue();
    });

    (authService.obtenerUsuarioActual as jasmine.Spy).and.returnValue({
      nombre: 'Not Admin',
      es_admin: false
    });

    const navigateSpy = spyOn(router, 'navigate');
    TestBed.runInInjectionContext(() => {
      expect(adminGuard()).toBeFalse();
    });
  });

  it('should call obtenerUsuarioActual to check permissions', () => {
    spyOn(authService, 'obtenerUsuarioActual').and.returnValue(null);
    
    TestBed.runInInjectionContext(() => {
      adminGuard();
    });
    
    expect(authService.obtenerUsuarioActual).toHaveBeenCalled();
  });
});