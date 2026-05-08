import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TiendaComponent } from './tienda';
import { AuthService } from '../services/auth.service';
import { CarritoService } from '../services/carrito.service';
import { NotificationService } from '../services/notification.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

describe('TiendaComponent', () => {
  let component: TiendaComponent;
  let fixture: ComponentFixture<TiendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TiendaComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        AuthService,
        CarritoService,
        NotificationService,
        ConfirmDialogService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TiendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
