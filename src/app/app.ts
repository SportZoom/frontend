import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationsComponent } from './notifications';
import { ConfirmDialogComponent } from './confirm-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationsComponent, ConfirmDialogComponent],
  template: `
    <router-outlet />
    <app-notifications />
    <app-confirm-dialog />
  `,
  styleUrls: ['./app.css']
})
export class AppComponent {}
