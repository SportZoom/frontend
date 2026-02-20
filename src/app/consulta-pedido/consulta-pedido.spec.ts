import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaPedido } from './consulta-pedido';

describe('ConsultaPedido', () => {
  let component: ConsultaPedido;
  let fixture: ComponentFixture<ConsultaPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaPedido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaPedido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
