import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private idCounter = 0;

  constructor(private ngZone: NgZone) {}

  getNotifications() {
    return this.notifications$.asObservable();
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  private show(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    this.ngZone.run(() => {
      const notification: Notification = {
        id: this.idCounter++,
        message,
        type
      };

      const current = this.notifications$.value;
      this.notifications$.next([...current, notification]);

      // Auto-eliminar después de 4 segundos
      setTimeout(() => {
        this.ngZone.run(() => {
          this.remove(notification.id);
        });
      }, 4000);
    });
  }

  remove(id: number) {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }
}