import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService, ConfirmDialogState } from './services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html'
})
export class ConfirmDialogComponent implements OnInit {
  state: ConfirmDialogState = {
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    open: false
  };

  constructor(private confirmDialogService: ConfirmDialogService) {}

  ngOnInit() {
    this.confirmDialogService.getState().subscribe((state) => {
      this.state = state;
    });
  }

  cancel() {
    this.confirmDialogService.resolve(false);
  }

  accept() {
    this.confirmDialogService.resolve(true);
  }
}
