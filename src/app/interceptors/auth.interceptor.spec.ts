import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        AuthService
      ]
    });
    authService = TestBed.inject(AuthService);
    localStorage.clear();
  });

  const createMockRequest = (): HttpRequest<unknown> => {
    return new HttpRequest('GET', '/api/test');
  };

  it('should add Authorization header when token exists', () => {
    spyOn(authService, 'obtenerToken').and.returnValue('test-token-123');
    
    const req = createMockRequest();
    const next = jasmine.createSpy().and.returnValue(new HttpResponse({ body: {} }));

    TestBed.runInInjectionContext(() => AuthInterceptor(req, next));
    
    expect(next).toHaveBeenCalled();
    const clonedReq = next.calls.first().args[0];
    expect(clonedReq.headers.get('Authorization')).toBe('Bearer test-token-123');
  });

  it('should not add Authorization header when no token exists', () => {
    spyOn(authService, 'obtenerToken').and.returnValue(null);
    
    const req = createMockRequest();
    const next = jasmine.createSpy().and.returnValue(new HttpResponse({ body: {} }));

    TestBed.runInInjectionContext(() => AuthInterceptor(req, next));
    
    expect(next).toHaveBeenCalled();
    const passedReq = next.calls.first().args[0];
    expect(passedReq.headers.has('Authorization')).toBeFalse();
  });

  it('should pass through request when token exists', () => {
    spyOn(authService, 'obtenerToken').and.returnValue('valid-token');
    
    const req = createMockRequest();
    const next = jasmine.createSpy().and.returnValue(new HttpResponse({ body: { success: true } }));

    TestBed.runInInjectionContext(() => AuthInterceptor(req, next));
    
    expect(next).toHaveBeenCalled();
  });

  it('should clone request with Authorization header', () => {
    spyOn(authService, 'obtenerToken').and.returnValue('new-token');
    
    const req = createMockRequest();
    const next = jasmine.createSpy().and.returnValue(new HttpResponse({ body: {} }));

    TestBed.runInInjectionContext(() => AuthInterceptor(req, next));
    
    const clonedReq = next.calls.first().args[0];
    expect(clonedReq).not.toBe(req);
    expect(clonedReq.headers.get('Authorization')).toBe('Bearer new-token');
  });

  it('should handle empty token', () => {
    spyOn(authService, 'obtenerToken').and.returnValue('');
    
    const req = createMockRequest();
    const next = jasmine.createSpy().and.returnValue(new HttpResponse({ body: {} }));

    TestBed.runInInjectionContext(() => AuthInterceptor(req, next));
    
    const passedReq = next.calls.first().args[0];
    expect(passedReq.headers.has('Authorization')).toBeFalse();
  });

  it('should call authService.obtenerToken', () => {
    spyOn(authService, 'obtenerToken').and.returnValue('spy-token');
    
    const req = createMockRequest();
    const next = jasmine.createSpy().and.returnValue(new HttpResponse({ body: {} }));
    
    TestBed.runInInjectionContext(() => AuthInterceptor(req, next));
    
    expect(authService.obtenerToken).toHaveBeenCalled();
  });
});