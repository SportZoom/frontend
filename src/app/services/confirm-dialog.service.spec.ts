import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService, ConfirmDialogState } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmDialogService]
    });
    service = TestBed.inject(ConfirmDialogService);
  });

  describe('getState', () => {
    it('should return observable of dialog state', () => {
      const state$ = service.getState();
      expect(state$).toBeDefined();
    });

    it('should have closed state initially', () => {
      let isOpen = false;
      service.getState().subscribe(state => {
        if (!state.open) {
          isOpen = true;
        }
      });
      expect(isOpen).toBeTrue();
    });
  });

  describe('request', () => {
    it('should return a Promise<boolean>', () => {
      const result = service.request({ title: 'Test' });
      expect(result).toBeInstanceOf(Promise);
    });

    it('should open dialog state', () => {
      let open = false;
      service.getState().subscribe(state => {
        if (state.open && state.title === 'Confirm Delete') {
          open = true;
        }
      });
      service.request({ title: 'Confirm Delete' });
      expect(open).toBeTrue();
    });

    it('should use custom options', () => {
      let title = '';
      let message = '';
      service.getState().subscribe(state => {
        if (state.title) title = state.title;
        if (state.message) message = state.message;
      });
      service.request({
        title: 'Custom Title',
        message: 'Custom Message'
      });
      expect(title).toBe('Custom Title');
      expect(message).toBe('Custom Message');
    });
  });

  describe('resolve', () => {
    it('should close dialog when resolved', () => {
      let open = true;
      service.getState().subscribe(state => {
        if (!state.open) {
          open = false;
        }
      });
      service.request({ title: 'Test' });
      service.resolve(true);
      expect(open).toBeFalse();
    });

    it('should call resolver with true when confirmed', async () => {
      const promise = service.request({ title: 'Test' });
      service.resolve(true);
      const result = await promise;
      expect(result).toBeTrue();
    });

    it('should call resolver with false when cancelled', async () => {
      const promise = service.request({ title: 'Test' });
      service.resolve(false);
      const result = await promise;
      expect(result).toBeFalse();
    });
  });
});
