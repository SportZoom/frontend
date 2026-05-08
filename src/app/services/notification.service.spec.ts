import { TestBed } from '@angular/core/testing';
import { NotificationService, Notification } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
  });

  describe('getNotifications', () => {
    it('should return observable of notifications', () => {
      const notifications = service.getNotifications();
      expect(notifications).toBeDefined();
    });
  });

  describe('success', () => {
    it('should call show with success type', () => {
      spyOn(service as any, 'show');
      service.success('Test message');
      expect((service as any).show).toHaveBeenCalledWith('Test message', 'success');
    });
  });

  describe('error', () => {
    it('should call show with error type', () => {
      spyOn(service as any, 'show');
      service.error('Error message');
      expect((service as any).show).toHaveBeenCalledWith('Error message', 'error');
    });
  });

  describe('info', () => {
    it('should call show with info type', () => {
      spyOn(service as any, 'show');
      service.info('Info message');
      expect((service as any).show).toHaveBeenCalledWith('Info message', 'info');
    });
  });

  describe('warning', () => {
    it('should call show with warning type', () => {
      spyOn(service as any, 'show');
      service.warning('Warning message');
      expect((service as any).show).toHaveBeenCalledWith('Warning message', 'warning');
    });
  });

  describe('remove', () => {
    it('should filter out notification by id', () => {
      service.success('Test 1');
      service.success('Test 2');
      
      let notifications: Notification[] = [];
      service.getNotifications().subscribe(n => notifications = n);
      
      expect(notifications.length).toBeGreaterThan(0);
      const firstId = notifications[0].id;
      
      service.remove(firstId);
      
      let updatedNotifications: Notification[] = [];
      service.getNotifications().subscribe(n => updatedNotifications = n);
      
      const found = updatedNotifications.find(n => n.id === firstId);
      expect(found).toBeUndefined();
    });

    it('should handle removing non-existent id', () => {
      expect(() => service.remove(999)).not.toThrow();
    });
  });
});
