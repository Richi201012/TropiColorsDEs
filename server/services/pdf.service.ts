/**
 * PDF Generation Service
 * 
 * Genera facturas profesionales en formato PDF usando jsPDF
 * 
 * Decisiones técnicas:
 * - jsPDF: Ligero, funciona en Node.js, sin dependencias nativas
 * - Layout: Estructura profesional similar a CFDI mexicano
 * - Moneda: Formato MXN con decimales
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import path from "path";
import fs from "fs";
import type { Invoice, InvoiceConcept } from "../../shared/schema.js";

/**
 * Datos del emisor predefinidos para TropicColors
 */
const ISSUER_DATA = {
  name: "TropicColors SA de CV",
  rfc: "TCO980123ABC",
  address: "Av. Principal 123, Col. Centro, Ciudad de México, CP 01000",
  email: "facturas@tropicolors.com",
  phone: "55-1234-5678",
};

/**
 * Formatea un monto en centavos a formato moneda
 * Si el valor ya está en pesos (mayor a 10000), no divide
 */
function formatCurrency(cents: number): string {
  // Si el valor es mayor a 10000, asumimos que ya está en centavos
  // Los precios típicos en MXN para productos son menores a 10000 pesos
  const isCents = cents > 10000;
  const value = isCents ? cents / 100 : cents;
  
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Formatea una fecha a formato legible
 */
function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Genera el contenido de la tabla de conceptos
 */
function generateConceptsTable(
  doc: jsPDF,
  startY: number,
  concepts: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>
): number {
  const tableData = concepts.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.amount),
  ]);

  autoTable(doc, {
    startY,
    head: [["#", "Descripción", "Cantidad", "P. Unitario", "Importe"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [13, 148, 136], // Teal-600
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59], // Slate-800
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 80 },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
    margin: { left: 15, right: 15 },
    didDrawPage: () => {},
  });

  // Retorna la posición Y después de la tabla
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
}

/**
 * Genera la sección de totales
 */
function generateTotalsSection(
  doc: jsPDF,
  startY: number,
  subtotal: number,
  taxRate: number,
  taxAmount: number,
  total: number
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightMargin = 15;
  const totalsX = pageWidth - rightMargin - 70;

  doc.setFontSize(10);
  
  // Subtotal
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("Subtotal:", totalsX, startY);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(formatCurrency(subtotal), pageWidth - rightMargin, startY, { align: "right" });
  
  // IVA
  startY += 7;
  doc.setTextColor(100, 116, 139);
  doc.text(`IVA (${taxRate}%):`, totalsX, startY);
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(taxAmount), pageWidth - rightMargin, startY, { align: "right" });
  
  // Línea separadora
  startY += 5;
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(totalsX - 10, startY, pageWidth - rightMargin, startY);
  
  // Total
  startY += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136); // Teal-600
  doc.text("TOTAL:", totalsX, startY);
  doc.text(formatCurrency(total), pageWidth - rightMargin, startY, { align: "right" });
  
  return startY + 15;
}

/**
 * Genera el pie de página con información fiscal
 */
function generateFooter(doc: jsPDF, startY: number, notes?: string | null): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Notas (si existen)
  if (notes) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Notas:", margin, startY);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(notes, pageWidth - margin * 2);
    doc.text(splitNotes, margin, startY + 5);
    startY += 10 + splitNotes.length * 4;
  }
  
  // Información de pago
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Forma de pago: Pago único", margin, startY);
  doc.text("Método de pago: Transferencia Electrónica (TEF)", margin, startY + 5);
  
  // Footer inferior
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.rect(0, pageHeight - 30, pageWidth, 30, "F");
  
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${ISSUER_DATA.name} | RFC: ${ISSUER_DATA.rfc}`,
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" }
  );
  doc.text(
    "Este documento es una representación impresa de un comprobante fiscal digital",
    pageWidth / 2,
    pageHeight - 14,
    { align: "center" }
  );
  doc.text(
    "TropicColors - tropicolors.com.mx",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );
}

/**
 * Genera un PDF de factura y lo guarda en el directorio especificado
 */
export async function generateInvoicePDF(
  invoice: Invoice,
  concepts: InvoiceConcept[]
): Promise<string> {
  // Crear documento PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  // ============================================
  // ENCABEZADO
  // ============================================
  
  // Logo (si existe)
  const logoPath = path.join(process.cwd(), "attached_assets", "logo-tropicolors-removebg-preview.png");
  if (fs.existsSync(logoPath)) {
    try {
      doc.addImage(
        fs.readFileSync(logoPath),
        "PNG",
        margin,
        10,
        40,
        20
      );
    } catch (logoError) {
      console.warn("No se pudo agregar el logo:", logoError);
    }
  }
  
  // Título de factura
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136); // Teal-600
  doc.text("FACTURA", pageWidth - margin, 18, { align: "right" });
  
  // Número y fecha
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(`No. ${invoice.invoiceNumber}`, pageWidth - margin, 26, { align: "right" });
  doc.text(`Fecha: ${formatDate(invoice.createdAt)}`, pageWidth - margin, 31, { align: "right" });
  doc.text("Vigencia: 30 días", pageWidth - margin, 36, { align: "right" });
  
  // ============================================
  // DATOS FISCALES (EMISOR Y CLIENTE)
  // ============================================
  
  let currentY = 50;
  
  // Encabezado de sección
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.rect(margin, currentY - 4, pageWidth - margin * 2, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("DATOS FISCALES", margin + 2, currentY + 1);
  
  currentY += 10;
  
  // Datos del emisor (izquierda)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136);
  doc.text("EMISOR", margin, currentY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  currentY += 6;
  doc.text(ISSUER_DATA.name, margin, currentY);
  currentY += 5;
  doc.setTextColor(100, 116, 139);
  doc.text(`RFC: ${ISSUER_DATA.rfc}`, margin, currentY);
  currentY += 5;
  doc.text(ISSUER_DATA.address, margin, currentY);
  currentY += 5;
  doc.text(`Email: ${ISSUER_DATA.email}`, margin, currentY);
  if (ISSUER_DATA.phone) {
    currentY += 5;
    doc.text(`Tel: ${ISSUER_DATA.phone}`, margin, currentY);
  }
  
  // Datos del cliente (derecha)
  const clientX = pageWidth / 2 + 5;
  currentY = 60; // Reset Y
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(99, 102, 241); // Indigo-500
  doc.text("CLIENTE", clientX, currentY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  currentY += 6;
  doc.text(invoice.customerName, clientX, currentY);
  currentY += 5;
  doc.setTextColor(100, 116, 139);
  doc.text(`RFC: ${invoice.customerRFC}`, clientX, currentY);
  currentY += 5;
  doc.text(invoice.customerAddress, clientX, currentY);
  currentY += 5;
  doc.text(`Email: ${invoice.customerEmail}`, clientX, currentY);
  
  // ============================================
  // TABLA DE CONCEPTOS
  // ============================================
  
  currentY += 15;
  
  // Encabezado de sección
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY - 4, pageWidth - margin * 2, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("CONCEPTOS", margin + 2, currentY + 1);
  
  currentY += 10;
  
  // Generar tabla
  const tableData = concepts.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.quantity.toLocaleString("es-MX"),
    formatCurrency(item.unitPrice),
    formatCurrency(item.amount),
  ]);
  
  autoTable(doc, {
    startY: currentY,
    head: [["#", "Descripción", "Cantidad", "P. Unitario", "Importe"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [13, 148, 136],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 85 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });
  
  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  
  // ============================================
  // TOTALES
  // ============================================
  
  const totalsX = pageWidth - margin - 65;
  
  // Subtotal
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Subtotal:", totalsX, currentY);
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - margin, currentY, { align: "right" });
  
  // IVA
  currentY += 7;
  doc.setTextColor(100, 116, 139);
  doc.text(`IVA (${invoice.taxRate}%):`, totalsX, currentY);
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(invoice.taxAmount), pageWidth - margin, currentY, { align: "right" });
  
  // Línea
  currentY += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(totalsX - 5, currentY, pageWidth - margin, currentY);
  
  // Total
  currentY += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136);
  doc.text("TOTAL:", totalsX, currentY);
  doc.text(formatCurrency(invoice.total), pageWidth - margin, currentY, { align: "right" });
  
  // ============================================
  // PIE DE PÁGINA
  // ============================================
  
  currentY += 20;
  generateFooter(doc, currentY, invoice.notes);
  
  // Guardar PDF
  const pdfDir = path.join(process.cwd(), "invoices");
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  
  const pdfPath = path.join(pdfDir, `${invoice.invoiceNumber}.pdf`);
  doc.save(pdfPath);
  
  return pdfPath;
}

/**
 * Genera un PDF y lo retorna como Buffer (para enviar por email)
 */
export async function generateInvoicePDFBuffer(
  invoice: Invoice,
  concepts: InvoiceConcept[]
): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  // Logo
  const logoPath = path.join(process.cwd(), "attached_assets", "logo-tropicolors-removebg-preview.png");
  if (fs.existsSync(logoPath)) {
    try {
      doc.addImage(
        fs.readFileSync(logoPath),
        "PNG",
        margin,
        10,
        40,
        20
      );
    } catch {
      console.warn("No se pudo agregar el logo");
    }
  }
  
  // Título
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136);
  doc.text("FACTURA", pageWidth - margin, 18, { align: "right" });
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`No. ${invoice.invoiceNumber}`, pageWidth - margin, 26, { align: "right" });
  doc.text(`Fecha: ${formatDate(invoice.createdAt)}`, pageWidth - margin, 31, { align: "right" });
  
  let currentY = 50;
  
  // Emisor
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136);
  doc.text("EMISOR", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  currentY += 6;
  doc.text(ISSUER_DATA.name, margin, currentY);
  currentY += 5;
  doc.setTextColor(100, 116, 139);
  doc.text(`RFC: ${ISSUER_DATA.rfc}`, margin, currentY);
  currentY += 5;
  doc.text(ISSUER_DATA.address, margin, currentY);
  
  // Cliente
  const clientX = pageWidth / 2 + 5;
  currentY = 56;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(99, 102, 241);
  doc.text("CLIENTE", clientX, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  currentY += 6;
  doc.text(invoice.customerName, clientX, currentY);
  currentY += 5;
  doc.setTextColor(100, 116, 139);
  doc.text(`RFC: ${invoice.customerRFC}`, clientX, currentY);
  currentY += 5;
  doc.text(invoice.customerAddress, clientX, currentY);
  
  // Tabla de conceptos
  currentY += 15;
  const tableData = concepts.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.quantity.toLocaleString("es-MX"),
    formatCurrency(item.unitPrice),
    formatCurrency(item.amount),
  ]);
  
  autoTable(doc, {
    startY: currentY,
    head: [["#", "Descripción", "Cantidad", "P. Unitario", "Importe"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [13, 148, 136],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 85 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });
  
  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  
  // Totales
  const totalsX = pageWidth - margin - 65;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Subtotal:", totalsX, currentY);
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - margin, currentY, { align: "right" });
  currentY += 7;
  doc.setTextColor(100, 116, 139);
  doc.text(`IVA (${invoice.taxRate}%):`, totalsX, currentY);
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(invoice.taxAmount), pageWidth - margin, currentY, { align: "right" });
  currentY += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 148, 136);
  doc.text("TOTAL:", totalsX, currentY);
  doc.text(formatCurrency(invoice.total), pageWidth - margin, currentY, { align: "right" });
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${ISSUER_DATA.name} | RFC: ${ISSUER_DATA.rfc}`, pageWidth / 2, pageHeight - 15, { align: "center" });
  doc.text("Este documento es una representación impresa de un comprobante fiscal digital", pageWidth / 2, pageHeight - 10, { align: "center" });
  
  // Retornar como buffer
  const pdfBuffer = doc.output("arraybuffer");
  return Buffer.from(pdfBuffer);
}
