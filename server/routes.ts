import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { simpleStorage } from "./storage-simple";
import { firebaseStorage } from "./storage-firebase";
import { insertContactMessageSchema } from "../shared/schema.js";
import {
  createCheckoutSession,
  constructStripeEvent,
  handleStripeEvent,
  ensureStripeWebhookConfigured,
  sendEmailViaBrevoAPI,
  generateOrderStatusEmailHTML,
} from "./payments.js";
import { rateLimit, contactRateLimit, paymentRateLimit } from "./rateLimit.js";
import fs from "fs";
import path from "path";
import { z } from "zod";

// ============================================
// INVOICE ROUTES - Facturación (Firebase)
// ============================================
import { insertInvoiceSchema } from "../shared/schema.js";
import * as invoiceFirebaseService from "./services/invoice-firebase.service.js";

/** Schema para validar datos de factura en request */
const createInvoiceSchema = insertInvoiceSchema;

/**
 * Registra las rutas de facturas en el servidor
 * Exportado para uso en index.ts
 */
export function registerInvoiceRoutes(app: Express): void {
  // ============================================
  // POST /api/invoices - Crear factura
  // ============================================
  app.post("/api/invoices", async (req, res) => {
    try {
      // Validar datos del request
      const validatedData = createInvoiceSchema.parse(req.body);

      // Crear factura (Firebase)
      const result = await invoiceFirebaseService.createInvoice(validatedData);

      if (!result.success) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.invoice!.id,
          invoiceNumber: result.invoice!.invoiceNumber,
          subtotal: result.invoice!.subtotal,
          taxAmount: result.invoice!.taxAmount,
          total: result.invoice!.total,
          status: result.invoice!.status,
          createdAt: result.invoice!.createdAt,
        },
      });
    } catch (error) {
      console.error("[Invoice API] Error al crear factura:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Datos inválidos",
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Error al crear la factura",
      });
    }
  });

  // ============================================
  // GET /api/invoices - Listar facturas
  // ============================================
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await invoiceFirebaseService.getInvoices();
      
      res.json({
        success: true,
        data: invoices,
      });
    } catch (error) {
      console.error("[Invoice API] Error al listar facturas:", error);
      res.status(500).json({
        success: false,
        error: "Error al listar las facturas",
      });
    }
  });

  // ============================================
  // GET /api/invoices/:id - Obtener factura
  // ============================================
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await invoiceFirebaseService.getInvoiceById(id);

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: "Factura no encontrada",
        });
        return;
      }

      const concepts = await invoiceFirebaseService.getInvoiceConcepts(id);

      res.json({
        success: true,
        data: {
          invoice,
          concepts,
        },
      });
    } catch (error) {
      console.error("[Invoice API] Error al obtener factura:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener la factura",
      });
    }
  });

  // ============================================
  // POST /api/invoices/:id/send - Enviar factura
  // ============================================
  app.post("/api/invoices/:id/send", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await invoiceFirebaseService.sendInvoice(id);

      if (!result.success) {
        const statusCode = result.error?.includes("no encontrada") ? 404 : 400;
        res.status(statusCode).json({ success: false, error: result.error });
        return;
      }

      res.json({
        success: true,
        message: "Factura enviada correctamente",
      });
    } catch (error) {
      console.error("[Invoice API] Error al enviar factura:", error);
      res.status(500).json({
        success: false,
        error: "Error al enviar la factura",
      });
    }
  });

  console.log("[Invoice API] Rutas registradas");
}

// Schema for updating order status
const updateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(["pending", "paid", "failed", "sent", "delivered"]),
  trackingNumber: z.string().optional(),
  shippingCompany: z.string().optional(),
});

// Email notification function for order status changes
async function sendOrderStatusEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  status: string,
  trackingInfo?: { trackingNumber: string; shippingCompany: string },
  shippingAddress?: string
) {
  console.log(`Sending status email to ${email} for order ${orderNumber}, status: ${status}`);
  
  try {
    // Generate HTML content
    const htmlContent = generateOrderStatusEmailHTML({
      orderNumber,
      customerName,
      customerEmail: email,
      status,
      trackingNumber: trackingInfo?.trackingNumber,
      shippingCompany: trackingInfo?.shippingCompany,
      shippingAddress,
    });
    
    if (!htmlContent) {
      console.error("Failed to generate email HTML");
      return { success: false };
    }
    
    // Determine subject based on status
    const subjects: Record<string, string> = {
      pending: `Tu pedido ${orderNumber} está siendo procesado - Tropicolors`,
      paid: `¡Tu pago ha sido confirmado! - Pedido ${orderNumber} - Tropicolors`,
      sent: `Tu pedido ${orderNumber} ha sido enviado - Tropicolors`,
      delivered: `Tu pedido ${orderNumber} ha sido entregado - Tropicolors`,
      failed: `Problema con tu pago - Pedido ${orderNumber} - Tropicolors`,
    };
    
    const subject = subjects[status] || `Actualización de tu pedido ${orderNumber} - Tropicolors`;
    
    // Generate text content based on status
    let textContent = "";
    switch (status) {
      case "pending":
        textContent = `Tu pedido ${orderNumber} está siendo procesado. Te notificaremos cuando tu pago sea confirmado.`;
        break;
      case "paid":
        textContent = `¡Tu pago ha sido confirmado! Tu pedido ${orderNumber} está siendo preparado para su envío.`;
        break;
      case "sent":
        textContent = `Tu pedido ${orderNumber} ha sido enviado. ${trackingInfo ? 'Número de rastreo: ' + trackingInfo.trackingNumber + ' - Paquetería: ' + trackingInfo.shippingCompany : ''}`;
        break;
      case "delivered":
        textContent = `Tu pedido ${orderNumber} ha sido entregado. ¡Gracias por tu compra en Tropicolors!`;
        break;
      case "failed":
        textContent = `El pago de tu pedido ${orderNumber} no pudo ser procesado. Por favor contacta al soporte.`;
        break;
      default:
        textContent = `Tu pedido ${orderNumber} ha sido actualizado.`;
    }
    
    // Send email via Brevo
    const success = await sendEmailViaBrevoAPI(email, subject, htmlContent, textContent);
    
    if (success) {
      console.log("Status email sent successfully to:", email);
    } else {
      console.error("Failed to send status email");
    }
    
    return { success };
  } catch (error) {
    console.error("Error sending status email:", error);
    return { success: false };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Apply rate limiting to API routes
  app.use("/api", rateLimit({ limit: 100, windowMs: 15 * 60 * 1000 }));

  app.post("/api/checkout", paymentRateLimit, async (req, res) => {
    try {
      const result = await createCheckoutSession(req.body);
      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error creando checkout:", error);
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo iniciar el pago.",
      });
    }
  });

  app.post("/api/payment-webhook", async (req: Request, res) => {
    try {
      ensureStripeWebhookConfigured();
      const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
      if (!rawBody) {
        throw new Error("No pudimos leer el cuerpo del webhook.");
      }

      const event = constructStripeEvent(rawBody, req.headers["stripe-signature"]);
      await handleStripeEvent(event);
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo procesar el webhook.";
      res.status(400).json({ success: false, message });
    }
  });

  app.post("/api/contact", contactRateLimit, async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json({ 
        success: true, 
        message: "Mensaje enviado correctamente",
        id: message.id 
      });
    } catch (error) {
      console.error("Error saving contact message:", error);
      res.status(400).json({ 
        success: false, 
        message: "Error al enviar el mensaje. Por favor verifica los datos." 
      });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error al obtener mensajes" 
      });
    }
  });

  // Test endpoint for email template
  app.get("/api/test-email-template", async (req, res) => {
    try {
      const templatePath = path.join(process.cwd(), "email-templates", "order-confirmation.html");
      res.json({
        templatePath,
        exists: fs.existsSync(templatePath),
        cwd: process.cwd(),
      });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Send invoice via email
  app.post("/api/send-invoice", async (req, res) => {
    try {
      const { email, clientName, invoiceNumber, invoiceData, pdfBase64 } = req.body;
      
      if (!email || !clientName || !invoiceNumber) {
        return res.status(400).json({ 
          success: false, 
          message: "Faltan datos requeridos" 
        });
      }
      
      console.log(`Sending invoice ${invoiceNumber} to ${email}`);
      
      // Generate HTML content for the invoice email
      const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];
      const subtotal = Number(invoiceData.subtotal) || 0;
      const tax = Number(invoiceData.tax || invoiceData.iva) || 0;
      const total = Number(invoiceData.total) || 0;
      
      const itemsHtml = items
        .filter((item: any) => item.description && item.quantity > 0)
        .map((item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${Number(item.unitPrice || 0).toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * Number(item.unitPrice || 0)).toFixed(2)}</td>
          </tr>
        `).join('');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Factura ${invoiceNumber}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: #0f295c; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">TROPICOLORS</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Colorantes Artificiales de Calidad</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #0f295c; margin-top: 0;">Factura No. ${invoiceNumber}</h2>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-MX")}</p>
            
            <h3 style="color: #0f295c; border-bottom: 2px solid #0f295c; padding-bottom: 5px;">Datos del Cliente</h3>
            <p><strong>Nombre:</strong> ${invoiceData.clientName}</p>
            <p><strong>RFC:</strong> ${invoiceData.clientRfc}</p>
            <p><strong>Email:</strong> ${invoiceData.clientEmail || "-"}</p>
            <p><strong>Telefono:</strong> ${invoiceData.clientPhone || "-"}</p>
            
            <h3 style="color: #0f295c; border-bottom: 2px solid #0f295c; padding-bottom: 5px;">Detalle de la Factura</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #0f295c; color: white;">
                  <th style="padding: 10px; text-align: left;">Descripcion</th>
                  <th style="padding: 10px; text-align: center;">Cant.</th>
                  <th style="padding: 10px; text-align: right;">P. Unitario</th>
                  <th style="padding: 10px; text-align: right;">Importe</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 15px;">
              <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
              <p><strong>IVA (16%):</strong> ${tax.toFixed(2)}</p>
              <p style="font-size: 18px; color: #0f295c;"><strong>Total: ${total.toFixed(2)}</strong></p>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              Gracias por su preferencia.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Tropicolors - Colorantes Artificiales de Calidad</p>
            <p>tropicolors20@outlook.es | +52 55 5114 6856</p>
          </div>
        </body>
        </html>
      `;
      
      // Prepare email with attachment if PDF is provided
      const emailOptions = {
        to: email,
        subject: `Factura ${invoiceNumber} - Tropicolors`,
        html: htmlContent,
        text: `Factura ${invoiceNumber} de Tropicolors. Adjunto encontrará su factura en formato PDF.`,
      };
      
      // Add PDF attachment if provided
      let attachment;
      if (pdfBase64) {
        attachment = {
          content: pdfBase64,
          filename: `factura-${invoiceNumber}.pdf`,
          type: "application/pdf",
        };
      }
      
      // Send email using Brevo
      await sendEmailViaBrevoAPI(
        emailOptions.to,
        emailOptions.subject,
        emailOptions.html,
        emailOptions.text,
        attachment
      );
      
      console.log(`Invoice ${invoiceNumber} sent successfully to ${email}`);
      
      res.json({ 
        success: true, 
        message: "Factura enviada correctamente" 
      });
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error al enviar la factura" 
      });
    }
  });

  // Public API - Get order by order number (for tracking page)
  app.get("/api/orders/:orderNumber", async (req, res) => {
    const { orderNumber } = req.params;
    
    if (!orderNumber) {
      res.status(400).json({ success: false, message: "Order number is required" });
      return;
    }
    
    try {
      let order;
      try {
        order = await firebaseStorage.getOrderByNumber(orderNumber);
      } catch (firebaseError) {
        console.log("Firebase not available, using simple storage");
        order = simpleStorage.getOrderById(orderNumber);
      }
      
      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }
      
      res.json({ success: true, order });
    } catch (error) {
      console.error("Error fetching order:", error);
      // Fallback to simple storage
      try {
        const order = simpleStorage.getOrderById(orderNumber);
        if (order) {
          res.json({ success: true, order });
        } else {
          res.status(404).json({ success: false, message: "Order not found" });
        }
      } catch (fallbackError) {
        res.status(500).json({ success: false, message: "Error fetching order" });
      }
    }
  });

  // Admin API - Get all orders
  app.get("/api/orders", async (req, res) => {
    try {
      // Try Firebase first, then simple storage
      let allOrders;
      try {
        allOrders = await firebaseStorage.getAllOrders();
      } catch (firebaseError) {
        console.log("Firebase not available, using simple storage");
        allOrders = simpleStorage.getAllOrders();
      }
      res.json({ success: true, orders: allOrders });
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Fallback to simple storage
      try {
        const orders = simpleStorage.getAllOrders();
        res.json({ success: true, orders });
      } catch (fallbackError) {
        res.status(500).json({ success: false, message: "Error fetching orders" });
      }
    }
  });

  // Update order status endpoint
  app.patch("/api/orders/status", async (req, res) => {
    // Always set content type to JSON - must be at the very beginning
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    
    console.log("API called: /api/orders/status", req.body);
    
    try {
      const validatedData = updateOrderStatusSchema.parse(req.body);
      const { orderId, status, trackingNumber, shippingCompany } = validatedData;

      console.log("Updating order status:", { orderId, status, trackingNumber, shippingCompany });

      // Try to update in Firebase first, then simple storage
      let updatedOrder;
      
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      // Add tracking info if status is 'sent'
      if (status === "sent") {
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (shippingCompany) updateData.shippingCompany = shippingCompany;
        updateData.shippedAt = new Date();
      }

      // Add deliveredAt if status is 'delivered'
      if (status === "delivered") {
        updateData.deliveredAt = new Date();
      }

      try {
        // Try Firebase storage
        updatedOrder = await firebaseStorage.updateOrder(orderId, updateData);
      } catch (firebaseError) {
        console.log("Firebase not available, using simple storage");
        // Fallback to simple storage
        updatedOrder = simpleStorage.updateOrder(orderId, updateData);
      }

      if (!updatedOrder) {
        res.setHeader("Content-Type", "application/json");
        res.status(404);
        return res.end(JSON.stringify({ success: false, message: "Pedido no encontrado" }));
      }

      // Send email notification for ALL status changes
      try {
        // Build shipping address from order data
        const shippingAddress = updatedOrder.shippingAddress 
          ? `${updatedOrder.shippingAddress}, ${updatedOrder.shippingCity || ''}, ${updatedOrder.shippingState || ''} ${updatedOrder.shippingPostalCode || ''}, ${updatedOrder.shippingCountry || ''}`
          : undefined;
          
        await sendOrderStatusEmail(
          updatedOrder.customerEmail,
          updatedOrder.customerName,
          updatedOrder.orderNumber,
          status,
          status === "sent" && trackingNumber ? { trackingNumber, shippingCompany: shippingCompany || "" } : undefined,
          shippingAddress
        );
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't fail the request if email fails
      }

      // Send JSON response
      const responseData = { success: true, order: updatedOrder };
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(responseData));
      return;
    } catch (error) {
      console.error("Error updating order status:", error);
      res.setHeader("Content-Type", "application/json");
      if (error instanceof z.ZodError) {
        res.status(400);
        return res.end(JSON.stringify({ success: false, message: "Datos inválidos", errors: error.errors }));
      }
      res.status(500);
      return res.end(JSON.stringify({ success: false, message: "Error al actualizar el estado del pedido" }));
    }
  });

  return httpServer;
}
