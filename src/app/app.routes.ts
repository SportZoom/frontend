import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { TiendaComponent } from './tienda/tienda';
import { CarritoComponent } from './carrito/carrito';
import { CheckoutComponent } from './checkout/checkout';
import { ConfirmacionComponent } from './confirmacion/confirmacion';
import { AdminPedidosComponent } from './admin-pedidos/admin-pedidos';
import { ConsultaPedidoComponent } from './consulta-pedido/consulta-pedido';
import { adminGuard } from './guards/admin.guard'; 

export const routes: Routes = [
  { path: '', redirectTo: 'tienda', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'tienda', component: TiendaComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'confirmacion', component: ConfirmacionComponent },
  { path: 'consulta-pedido', component: ConsultaPedidoComponent },
  { path: 'admin/pedidos', component: AdminPedidosComponent, canActivate: [adminGuard] },
];
