import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmDialogState {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  open: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private resolver: ((confirmed: boolean) => void) | null = null;
  private state$ = new BehaviorSubject<ConfirmDialogState>({
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    open: false
  });

  getState() {
    return this.state$.asObservable();
  }

  request(options: Partial<Omit<ConfirmDialogState, 'open'>>): Promise<boolean> {
    this.state$.next({
      title: options.title || 'Confirmar accion',
      message: options.message || 'Esta accion requiere confirmacion.',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      open: true
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  resolve(confirmed: boolean) {
    this.state$.next({ ...this.state$.value, open: false });
    if (this.resolver) {
      this.resolver(confirmed);
      this.resolver = null;
    }
  }
}
