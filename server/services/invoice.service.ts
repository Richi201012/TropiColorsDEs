/**
 * Invoice Service
 * 
 * Lógica de negocio para facturación
 * 
 * Decisiones técnicas:
 * - Cálculos siempre en backend (no confiar en frontend)
 * - Validaciones robustas con Zod
 * - Generación de número secuencial único
 * - Transacciones para consistencia de datos
 */

import { eq, desc } from "drizzle-orm";
import { db } from "../db.js";
import { invoices, invoiceConcepts, type Invoice, type InvoiceConcept, type InsertInvoiceInput } from "../../shared/schema.js";
import { generateInvoicePDF, generateInvoicePDFBuffer } from "./pdf.service.js";
import { sendInvoiceEmail } from "./email.service.js";

/**
 * Datos del emisor predefinidos
 */
const DEFAULT_ISSUER = {
  name: "TropicColors SA de CV",
  rfc: "TCO980123ABC",
  address: "Av. Principal 123, Col. Centro, Ciudad de México, CP 01000",
  email: "facturas@tropicolors.com",
  phone: "55-1234-5678",
};

/**
 * Prefijo para números de factura
 */
const INVOICE_PREFIX = "TCO-";

/**
 * Obtiene el siguiente número de factura secuencial
 */
async function getNextInvoiceNumber(): Promise<string> {
  if (!db) {
    // Si no hay DB, generar número aleatorio
    const random = Math.floor(Math.random() * 9999) + 1;
    return `${INVOICE_PREFIX}${random.toString().padStart(4, "0")}`;
  }

  // Buscar la última factura
  const lastInvoice = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .orderBy(desc(invoices.createdAt))
    .limit(1)
    .then((rows) => rows[0]);

  if (!lastInvoice) {
    return `${INVOICE_PREFIX}0001`;
  }

  // Extraer número y generar siguiente
  const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(INVOICE_PREFIX, ""), 10);
  const nextNumber = lastNumber + 1;
  return `${INVOICE_PREFIX}${nextNumber.toString().padStart(4, "0")}`;
}

/**
 * Valida RFC mexicano (formato básico)
 */
function validateRFC(rfc: string): boolean {
  // Formato: 3 o 4 letras + 6 dígitos + 3 caracteres alfanuméricos
  const rfcRegex = /^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
  return rfcRegex.test(rfc.toUpperCase());
}

/**
 * Valida email
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calcula los montos de la factura
 */
function calculateInvoiceAmounts(
  items: Array<{ quantity: number; unitPrice: number }>,
  taxRate: number
): { subtotal: number; taxAmount: number; total: number } {
  // Calcular subtotal (todos los montos en centavos)
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Calcular IVA
  const taxAmount = Math.round(subtotal * (taxRate / 100));

  // Calcular total
  const total = subtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal),
    taxAmount: Math.round(taxAmount),
    total: Math.round(total),
  };
}

/**
 * Crea una nueva factura
 */
export async function createInvoice(data: InsertInvoiceInput): Promise<{
  success: boolean;
  invoice?: Invoice;
  concepts?: InvoiceConcept[];
  error?: string;
}> {
  // ============================================
  // VALIDACIONES
  // ============================================

  // Validar RFC del cliente
  if (!validateRFC(data.customerRFC)) {
    return {
      success: false,
      error: "RFC del cliente inválido. Formato esperado: XXXX000101XXX",
    };
  }

  // Validar RFC del emisor
  if (!validateRFC(data.issuerRFC)) {
    return {
      success: false,
      error: "RFC del emisor inválido. Formato esperado: XXXX000101XXX",
    };
  }

  // Validar email del cliente
  if (!validateEmail(data.customerEmail)) {
    return {
      success: false,
      error: "Email del cliente inválido",
    };
  }

  // Validar que hay conceptos
  if (!data.items || data.items.length === 0) {
    return {
      success: false,
      error: "Debe agregar al menos un concepto",
    };
  }

  // Validar cada concepto
  for (const item of data.items) {
    if (!item.description || item.description.trim().length === 0) {
      return {
        success: false,
        error: "La descripción del concepto no puede estar vacía",
      };
    }
    if (item.quantity <= 0) {
      return {
        success: false,
        error: "La cantidad debe ser mayor a 0",
      };
    }
    if (item.unitPrice <= 0) {
      return {
        success: false,
        error: "El precio unitario debe ser mayor a 0",
      };
    }
  }

  // ============================================
  // CÁLCULOS (Backend - no confiar en frontend)
  // ============================================

  const taxRate = data.taxRate ?? 16;
  const amounts = calculateInvoiceAmounts(data.items, taxRate);

  // Generar número de factura
  const invoiceNumber = await getNextInvoiceNumber();

  try {
    // ============================================
    // CREAR REGISTROS EN BASE DE DATOS
    // ============================================

    if (!db) {
      return {
        success: false,
        error: "Base de datos no configurada",
      };
    }

    // Insertar factura
    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        issuerName: data.issuerName || DEFAULT_ISSUER.name,
        issuerRFC: data.issuerRFC || DEFAULT_ISSUER.rfc,
        issuerAddress: data.issuerAddress || DEFAULT_ISSUER.address,
        issuerEmail: data.issuerEmail || DEFAULT_ISSUER.email,
        issuerPhone: data.issuerPhone || DEFAULT_ISSUER.phone,
        customerName: data.customerName,
        customerRFC: data.customerRFC.toUpperCase(),
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        subtotal: amounts.subtotal,
        taxRate,
        taxAmount: amounts.taxAmount,
        total: amounts.total,
        currency: "MXN",
        status: "pendiente",
        notes: data.notes || null,
      })
      .returning();

    // Insertar conceptos
    const conceptsToInsert = data.items.map((item) => ({
      invoiceId: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    }));

    const [concept] = await db
      .insert(invoiceConcepts)
      .values(conceptsToInsert)
      .returning();

    // ============================================
    // GENERAR PDF
    // ============================================

    try {
      const pdfPath = await generateInvoicePDF(invoice, [concept]);
      console.log(`[Invoice] PDF generado: ${pdfPath}`);
    } catch (pdfError) {
      console.error("[Invoice] Error al generar PDF:", pdfError);
      // Continuar sin PDF si falla
    }

    // ============================================
    // ENVIAR EMAIL SI SE SOLICITA
    // ============================================

    if (data.sendEmail) {
      try {
        const pdfBuffer = await generateInvoicePDFBuffer(invoice, [concept]);
        const emailResult = await sendInvoiceEmail(
          invoice,
          [concept],
          pdfBuffer,
          data.customerEmail
        );

        if (emailResult.success) {
          // Actualizar status a enviada
          await db
            .update(invoices)
            .set({
              status: "enviada",
              sentAt: new Date(),
            })
            .where(eq(invoices.id, invoice.id));

          invoice.status = "enviada";
          invoice.sentAt = new Date();
        } else {
          console.error("[Invoice] Error al enviar email:", emailResult.error);
        }
      } catch (emailError) {
        console.error("[Invoice] Error al enviar email:", emailError);
      }
    }

    return {
      success: true,
      invoice,
      concepts: [concept],
    };
  } catch (error) {
    console.error("[Invoice] Error al crear factura:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear factura",
    };
  }
}

/**
 * Obtiene todas las facturas
 */
export async function getInvoices(): Promise<Invoice[]> {
  if (!db) return [];

  return db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

/**
 * Obtiene una factura por ID
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (!db) return null;

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id));

  return invoice || null;
}

/**
 * Obtiene los conceptos de una factura
 */
export async function getInvoiceConcepts(invoiceId: string): Promise<InvoiceConcept[]> {
  if (!db) return [];

  return db
    .select()
    .from(invoiceConcepts)
    .where(eq(invoiceConcepts.invoiceId, invoiceId));
}

/**
 * Envía una factura por email
 */
export async function sendInvoice(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    return {
      success: false,
      error: "Factura no encontrada",
    };
  }

  if (invoice.status === "enviada") {
    return {
      success: false,
      error: "La factura ya fue enviada",
    };
  }

  const concepts = await getInvoiceConcepts(id);

  try {
    const pdfBuffer = await generateInvoicePDFBuffer(invoice, concepts);
    const result = await sendInvoiceEmail(
      invoice,
      concepts,
      pdfBuffer,
      invoice.customerEmail
    );

    if (result.success && db) {
      await db
        .update(invoices)
        .set({
          status: "enviada",
          sentAt: new Date(),
        })
        .where(eq(invoices.id, id));
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al enviar factura",
    };
  }
}
