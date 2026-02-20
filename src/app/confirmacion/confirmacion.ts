import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion.html',
})
export class ConfirmacionComponent implements OnInit {
  recibo: any = null;
  cargando: boolean = true;  

  constructor(public router: Router) {}  

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const stateRecibo = navigation?.extras.state?.['recibo'];
    
    console.log('State de navegación:', navigation?.extras.state);
    console.log('Recibo del state:', stateRecibo);

    if (stateRecibo) {
      this.recibo = stateRecibo;
      this.cargando = false;
      console.log('Recibo cargado correctamente:', this.recibo);
    } else {
      const reciboGuardado = localStorage.getItem('ultimo_recibo');
      console.log('Recibo de localStorage:', reciboGuardado);
      
      if (reciboGuardado) {
        try {
          this.recibo = JSON.parse(reciboGuardado);
          this.cargando = false;
          console.log('Recibo recuperado de localStorage:', this.recibo);
        } catch (e) {
          console.error('Error parseando recibo de localStorage:', e);
          this.volverATienda();
        }
      } else {
        console.error('No se encontró recibo en ningún lugar');
        this.volverATienda();
      }
    }
  }

  volverATienda() {
    setTimeout(() => {
      alert('No se encontró información del pedido. Redirigiendo...');
      this.router.navigate(['/tienda']);
    }, 100);
  }

  descargarPDF() {
    if (!this.recibo) {
      console.error('No hay recibo para descargar');
      return;
    }

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Recibo de Compra', 105, 20, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      let y = 35;
      doc.text(`Número de pedido: ${this.recibo.numero_pedido || 'N/A'}`, 20, y);
      y += 10;
      doc.text(`Cliente: ${this.recibo.nombre || 'N/A'}`, 20, y);
      y += 10;
      doc.text(`Total: COP ${this.formatearPrecio(this.recibo.total || 0)}`, 20, y);
      y += 10;
      
      if (this.recibo.fecha) {
        doc.text(`Fecha: ${this.recibo.fecha}`, 20, y);
        y += 10;
      }
      
      doc.line(20, y, 190, y);
      y += 10;
      
      if (this.recibo.carrito && this.recibo.carrito.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Productos:', 20, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.text('Producto', 20, y);
        doc.text('Cant.', 120, y);
        doc.text('Precio', 150, y);
        
        doc.setLineWidth(0.3);
        doc.line(20, y + 2, 190, y + 2);
        y += 10;
        
        doc.setFont('helvetica', 'normal');
        this.recibo.carrito.forEach((item: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          const nombre = item.nombre || item.producto || 'Producto';
          const cantidad = item.cantidad || 1;
          const precio = item.precio || item.precio_unitario || 0;
          
          doc.text(nombre, 20, y);
          doc.text(String(cantidad), 120, y);
          doc.text(`COP ${this.formatearPrecio(precio)}`, 150, y);
          y += 10;
        });
        
        doc.line(20, y, 190, y);
        y += 10;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`TOTAL: COP ${this.formatearPrecio(this.recibo.total)}`, 190, y, { align: 'right' });
      
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
      }
      
      const nombreArchivo = `recibo_${this.recibo.numero_pedido || Date.now()}.pdf`;
      doc.save(nombreArchivo);
      
      console.log('PDF descargado correctamente:', nombreArchivo);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intenta nuevamente.');
    }
  }

  private formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  }
}

