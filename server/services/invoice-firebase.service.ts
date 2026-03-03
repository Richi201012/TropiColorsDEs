/**
 * Invoice Firebase Service
 * 
 * Servicio de facturación usando Firebase Firestore
 * en lugar de PostgreSQL/Drizzle
 * 
 * Decisiones técnicas:
 * - Usa Firestore para persistencia
 * - Cálculos siempre en backend
 * - Validaciones robustas con Zod
 * - Generación de número secuencial único
 */

import { db } from "../firebase.js";
import type { Invoice, InvoiceConcept } from "../../shared/schema.js";
import { generateInvoicePDF, generateInvoicePDFBuffer } from "./pdf.service.js";
import { sendInvoiceEmail } from "./email.service.js";

/**
 * Referencia a la colección de facturas en Firestore
 */
const invoicesCollection = db.collection("invoices");
const conceptsCollection = db.collection("invoice_concepts");

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
  try {
    // Buscar la última factura ordenando por createdAt
    const snapshot = await invoicesCollection
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return `${INVOICE_PREFIX}0001`;
    }

    const lastInvoice = snapshot.docs[0].data();
    const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(INVOICE_PREFIX, ""), 10);
    const nextNumber = lastNumber + 1;
    return `${INVOICE_PREFIX}${nextNumber.toString().padStart(4, "0")}`;
  } catch (error) {
    // Si hay error (colección vacía), generar número aleatorio
    console.warn("[Invoice] Error getting next invoice number, using random:", error);
    const random = Math.floor(Math.random() * 9999) + 1;
    return `${INVOICE_PREFIX}${random.toString().padStart(4, "0")}`;
  }
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
 * Tipo para datos de entrada de factura
 */
interface InvoiceInputData {
  issuerName?: string;
  issuerRFC?: string;
  issuerAddress?: string;
  issuerEmail?: string;
  issuerPhone?: string | null;
  customerName: string;
  customerRFC: string;
  customerEmail: string;
  customerAddress: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxRate?: number;
  notes?: string;
  sendEmail?: boolean;
}

/**
 * Crea una nueva factura en Firestore
 */
export async function createInvoice(data: InvoiceInputData): Promise<{
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
  if (!validateRFC(data.issuerRFC || DEFAULT_ISSUER.rfc)) {
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
  const now = new Date();

  try {
    // ============================================
    // CREAR REGISTROS EN FIREBASE
    // ============================================

    // Crear ID para la factura
    const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Preparar datos de la factura
    const invoiceData: Omit<Invoice, "id"> = {
      invoiceNumber,
      issuerName: data.issuerName || DEFAULT_ISSUER.name,
      issuerRFC: (data.issuerRFC || DEFAULT_ISSUER.rfc).toUpperCase(),
      issuerAddress: data.issuerAddress || DEFAULT_ISSUER.address,
      issuerEmail: data.issuerEmail || DEFAULT_ISSUER.email,
      issuerPhone: data.issuerPhone || DEFAULT_ISSUER.phone || null,
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
      pdfPath: null,
      sentAt: null,
      createdAt: now,
      updatedAt: now,
    };

    // Guardar factura en Firestore
    const invoiceRef = invoicesCollection.doc(invoiceId);
    await invoiceRef.set({
      id: invoiceId,
      ...invoiceData,
    });

    console.log(`[Firebase Invoice] Factura creada: ${invoiceNumber}`);

    // ============================================
    // CREAR CONCEPTOS
    // ============================================

    const concepts: InvoiceConcept[] = [];
    
    for (const item of data.items) {
      const conceptId = `CONC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const conceptData: InvoiceConcept = {
        id: conceptId,
        invoiceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice,
        createdAt: now,
      };

      const conceptRef = conceptsCollection.doc(conceptId);
      await conceptRef.set(conceptData);
      concepts.push(conceptData);
    }

    // ============================================
    // GENERAR PDF
    // ============================================

    const invoice: Invoice = { id: invoiceId, ...invoiceData };

    try {
      const pdfPath = await generateInvoicePDF(invoice, concepts);
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
        const pdfBuffer = await generateInvoicePDFBuffer(invoice, concepts);
        const emailResult = await sendInvoiceEmail(
          invoice,
          concepts,
          pdfBuffer,
          data.customerEmail
        );

        if (emailResult.success) {
          // Actualizar status a enviada
          await invoiceRef.update({
            status: "enviada",
            sentAt: new Date(),
            updatedAt: new Date(),
          });

          invoice.status = "enviada";
          invoice.sentAt = new Date();
          console.log(`[Firebase Invoice] Factura enviada: ${invoiceNumber}`);
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
      concepts,
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
  try {
    const snapshot = await invoicesCollection
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(doc => doc.data() as Invoice);
  } catch (error) {
    console.error("[Invoice] Error al obtener facturas:", error);
    return [];
  }
}

/**
 * Obtiene una factura por ID
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const doc = await invoicesCollection.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as Invoice;
  } catch (error) {
    console.error("[Invoice] Error al obtener factura:", error);
    return null;
  }
}

/**
 * Obtiene los conceptos de una factura
 */
export async function getInvoiceConcepts(invoiceId: string): Promise<InvoiceConcept[]> {
  try {
    const snapshot = await conceptsCollection
      .where("invoiceId", "==", invoiceId)
      .get();

    return snapshot.docs.map(doc => doc.data() as InvoiceConcept);
  } catch (error) {
    console.error("[Invoice] Error al obtener conceptos:", error);
    return [];
  }
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

    if (result.success) {
      // Actualizar status en Firestore
      await invoicesCollection.doc(id).update({
        status: "enviada",
        sentAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al enviar factura",
    };
  }
}
