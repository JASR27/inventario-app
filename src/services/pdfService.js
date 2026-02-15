import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export class PdfService {
  constructor(tasaCambio) {
    this.tasaCambio = tasaCambio;
    // Helper para formatear moneda local
    this.formatBs = (v) => 'Bs ' + parseFloat(v || 0).toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  generarNotaVenta(cliente, productos, pagos, totales) {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString();
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // --- Colores de Identidad ---
    const VERDE_OSCURO = [22, 101, 52];
    const VERDE_CLARO = [16, 185, 129];
    const GRIS_TEXTO = [100, 100, 100];

    // 1. Encabezado / Branding
    doc.setFontSize(20);
    doc.setTextColor(...VERDE_OSCURO);
    doc.setFont("helvetica", "bold");
    doc.text("NOTA DE ENTREGA", 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(...GRIS_TEXTO);
    doc.setFont("helvetica", "normal");
    doc.text("SISTEMA DE INVENTARIO VUE", 20, 30);
    doc.text(`Fecha: ${fecha}`, 190, 30, { align: 'right' });
    doc.text(`Hora: ${hora}`, 190, 35, { align: 'right' });
    doc.text(`Tasa del día: ${this.formatBs(this.tasaCambio)}`, 190, 40, { align: 'right' });

    // 2. Información del Cliente
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 45, 190, 45); // Línea divisoria

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL CLIENTE", 20, 53);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nombre: ${cliente.fullName}`, 20, 60);
    doc.text(`NID / Documento: ${cliente.nid}`, 20, 66);

    // 3. Tabla de Productos
    const columnasProd = ["Producto", "SKU", "Color", "Talla", "Cant.", "Precio ($)", "Subtotal ($)"];
    const filasProd = productos.map(item => [
      item.nombre,
      item.sku || 'N/A',
      item.color || 'N/A',
      item.talla || 'N/A',
      item.cantidad,
      item.sellingPrice.toFixed(2),
      (item.sellingPrice * item.cantidad).toFixed(2)
    ]);

    autoTable(doc, {
      startY: 75,
      head: [columnasProd],
      body: filasProd,
      headStyles: { fillColor: VERDE_CLARO, fontSize: 10, halign: 'center' },
      columnStyles: {
        4: { halign: 'center' }, // Cantidad
        5: { halign: 'right' },  // Precio
        6: { halign: 'right' }   // Subtotal
      },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      margin: { left: 20, right: 20 }
    });

    // 4. Tabla de Pagos Realizados (Justo debajo de productos)
    let currentY = doc.lastAutoTable.finalY + 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("PAGOS REGISTRADOS", 20, currentY);

    const columnasPagos = ["Método", "Monto (Bs)"];
    const filasPagos = pagos.map(p => [
      p.method.toUpperCase(),
      this.formatBs(p.amount)
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [columnasPagos],
      body: filasPagos,
      tableWidth: 80, // Tabla más pequeña
      headStyles: { fillColor: [71, 85, 105] }, // Gris azulado para diferenciar
      margin: { left: 20 }
    });

    // 5. Cuadro de Resumen Final (Totales)
    // Usamos el finalY de la tabla que esté más abajo
    const finalYTable = Math.max(doc.lastAutoTable.finalY, currentY);
    const boxY = finalYTable + 10;

    doc.setDrawColor(...VERDE_CLARO);
    doc.setLineWidth(0.5);
    doc.rect(120, boxY, 70, 25); // Recuadro de totales
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL USD:`, 125, boxY + 10);
    doc.text(`${totales.usd.toFixed(2)}$`, 185, boxY + 10, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(...VERDE_OSCURO);
    doc.text(`TOTAL BS:`, 125, boxY + 18);
    doc.text(`${this.formatBs(totales.bs)}`, 185, boxY + 18, { align: 'right' });

    // 6. Pie de página
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("Este documento es un comprobante de entrega de mercancía.", 105, 285, { align: 'center' });
    doc.text("Gracias por su preferencia.", 105, 290, { align: 'center' });

    // Descarga del archivo
    const nombreLimpio = cliente.fullName.replace(/\s+/g, '_');
    doc.save(`Nota_Entrega_${nombreLimpio}.pdf`);
  }
}