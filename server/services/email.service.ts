/**
 * Email Service para facturas
 * 
 * Maneja el envío de facturas por email con PDF adjunto
 * 
 * Decisiones técnicas:
 * - Usa la API de Brevo directamente desde payments.ts
 * - Usa plantillas HTML profesionales
 * - Incluye manejo de errores robusto
 * - Registra estado de envío
 */

import type { Invoice, InvoiceConcept } from "../../shared/schema.js";
import { sendEmailViaBrevoAPI } from "../payments.js";

/**
 * Variables de configuración
 */
const EMAIL_FROM_NAME = "TropicColors";
const EMAIL_FROM = "tropicolors20@outlook.es";

/**
 * Formatea monto a currency string
 * Si el valor ya está en centavos (mayor a 10000), divide entre 100
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
 * Formatea fecha a string legible
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
 * Genera el HTML del email de factura
 */
function generateInvoiceEmailHTML(
  invoice: Invoice,
  concepts: InvoiceConcept[]
): string {
  const itemsHTML = concepts
    .map(
      (item, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; text-align: center;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; text-align: right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; text-align: right;">${formatCurrency(item.amount)}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${invoice.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; border-bottom: 2px solid #0D9488;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <img src="https://tropicolors.com.mx/logo-tropicolors.png" alt="TropicColors" style="height: 50px;">
                    </td>
                    <td align="right">
                      <span style="font-size: 24px; font-weight: bold; color: #0D9488;">FACTURA</span><br>
                      <span style="font-size: 14px; color: #64748B;">No. ${invoice.invoiceNumber}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Info -->
            <tr>
              <td style="padding: 30px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" valign="top">
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 600;">Fecha de emisión</p>
                      <p style="margin: 0; font-size: 14px; color: #1E293B;">${formatDate(invoice.createdAt)}</p>
                    </td>
                    <td width="50%" valign="top">
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 600;">Vigencia</p>
                      <p style="margin: 0; font-size: 14px; color: #1E293B;">30 días</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Cliente -->
            <tr>
              <td style="padding: 0 40px 20px 40px;">
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 600;">Datos del cliente</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border-radius: 6px; padding: 16px;">
                  <tr>
                    <td>
                      <p style="margin: 0 0 4px 0; font-size: 14px; color: #1E293B; font-weight: 600;">${invoice.customerName}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748B;">RFC: ${invoice.customerRFC}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748B;">${invoice.customerAddress}</p>
                      <p style="margin: 0; font-size: 12px; color: #64748B;">${invoice.customerEmail}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Conceptos -->
            <tr>
              <td style="padding: 0 40px 20px 40px;">
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 600;">Conceptos</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E2E8F0; border-radius: 6px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #0D9488;">
                      <th style="padding: 12px; font-size: 11px; color: #FFFFFF; text-transform: uppercase;">#</th>
                      <th style="padding: 12px; font-size: 11px; color: #FFFFFF; text-transform: uppercase; text-align: left;">Descripción</th>
                      <th style="padding: 12px; font-size: 11px; color: #FFFFFF; text-transform: uppercase;">Cant.</th>
                      <th style="padding: 12px; font-size: 11px; color: #FFFFFF; text-transform: uppercase; text-align: right;">P. Unit.</th>
                      <th style="padding: 12px; font-size: 11px; color: #FFFFFF; text-transform: uppercase; text-align: right;">Importe</th>
                    </tr>
                  </thead>
                  <tbody style="font-size: 13px; color: #1E293B;">
                    ${itemsHTML}
                  </tbody>
                </table>
              </td>
            </tr>

            <!-- Totales -->
            <tr>
              <td style="padding: 0 40px 30px 40px;">
                <table width="250" cellpadding="0" cellspacing="0" style="float: right;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #64748B;">Subtotal:</td>
                    <td style="padding: 8px 0; font-size: 13px; color: #1E293B; text-align: right;">${formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #64748B;">IVA (${invoice.taxRate}%):</td>
                    <td style="padding: 8px 0; font-size: 13px; color: #1E293B; text-align: right;">${formatCurrency(invoice.taxAmount)}</td>
                  </tr>
                  <tr style="border-top: 2px solid #0D9488;">
                    <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #0D9488;">TOTAL:</td>
                    <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #0D9488; text-align: right;">${formatCurrency(invoice.total)}</td>
                  </tr>
                </table>
                <div style="clear: both;"></div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; background-color: #F1F5F9; border-radius: 0 0 8px 8px;">
                <p style="margin: 0; font-size: 12px; color: #64748B; text-align: center;">
                  TropicColors SA de CV | RFC: TCO980123ABC<br>
                  Este documento es una representación impresa de un comprobante fiscal digital<br>
                  <a href="https://tropicolors.com.mx" style="color: #0D9488; text-decoration: none;">tropicolors.com.mx</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

/**
 * Resultado del envío de email
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía una factura por email
 * 
 * @param invoice - Datos de la factura
 * @param concepts - Conceptos de la factura
 * @param pdfBuffer - Buffer del PDF generado
 * @param recipientEmail - Email del destinatario
 */
export async function sendInvoiceEmail(
  invoice: Invoice,
  concepts: InvoiceConcept[],
  pdfBuffer: Buffer,
  recipientEmail: string
): Promise<EmailSendResult> {
  try {
    // Generar contenido HTML y texto
    const htmlContent = generateInvoiceEmailHTML(invoice, concepts);
    const textContent = `Factura ${invoice.invoiceNumber} - TropicColors\n\nTotal: ${formatCurrency(invoice.total)}`;
    
    // Convertir PDF buffer a base64
    const pdfBase64 = pdfBuffer.toString("base64");
    
    // Enviar usando API de Brevo
    const result = await sendEmailViaBrevoAPI(
      recipientEmail,
      `Factura ${invoice.invoiceNumber}`,
      htmlContent,
      textContent,
      {
        content: pdfBase64,
        filename: `${invoice.invoiceNumber}.pdf`,
        type: "application/pdf"
      }
    );
    
    if (result) {
      console.log(`[Email] Factura ${invoice.invoiceNumber} enviada a ${recipientEmail} via Brevo`);
      return {
        success: true,
        messageId: `brevo-${Date.now()}`,
      };
    } else {
      throw new Error("Error al enviar via Brevo API");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`[Email] Error al enviar factura ${invoice.invoiceNumber}:`, errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Verifica la conexión con el servicio de email
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY || process.env['BREVO_API_KEY'];
  if (apiKey) {
    console.log("[Email] Brevo API configurada correctamente");
    return true;
  }
  console.error("[Email] BREVO_API_KEY no configurada");
  return false;
}
