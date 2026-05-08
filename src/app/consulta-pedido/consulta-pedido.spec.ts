import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ConsultaPedidoComponent } from './consulta-pedido';
import { CheckoutService } from '../services/checkout.service';
import { CarritoService } from '../services/carrito.service';

describe('ConsultaPedidoComponent', () => {
  let component: ConsultaPedidoComponent;
  let fixture: ComponentFixture<ConsultaPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaPedidoComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [CheckoutService, CarritoService]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
