import { Component } from '@angular/core';
import { TiendaComponent } from './tienda/tienda';
import { RouterOutlet } from '@angular/router';
import { NotificationsComponent } from './notifications'; // ← AGREGAR

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationsComponent],
  template: `
    <router-outlet />
    <app-notifications /> <!-- ← AGREGAR -->
     `,
  styleUrls: ['./app.css']
  
})
export class AppComponent {}
