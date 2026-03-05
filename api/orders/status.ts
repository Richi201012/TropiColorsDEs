import type { VercelRequest, VercelResponse } from "@vercel/node";
import { firebaseStorage } from "../server/storage-firebase.js";
import { simpleStorage } from "../server/storage-simple.js";
import { sendEmailViaBrevoAPI, generateOrderStatusEmailHTML } from "../server/payments.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { orderId, status, trackingNumber, shippingCompany } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "Missing orderId or status" });
    }

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

    let updatedOrder;
    
    // Try Firebase first, then simple storage
    try {
      updatedOrder = await firebaseStorage.updateOrder(orderId, updateData);
    } catch (firebaseError) {
      console.log("Firebase not available, using simple storage");
      updatedOrder = simpleStorage.updateOrder(orderId, updateData);
    }

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Send email notification for status change
    try {
      const htmlContent = generateOrderStatusEmailHTML({
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        status: status,
        trackingNumber: status === "sent" ? trackingNumber : undefined,
        shippingCompany: status === "sent" ? shippingCompany : undefined,
        shippingAddress: updatedOrder.shippingAddress 
          ? `${updatedOrder.shippingAddress}, ${updatedOrder.shippingCity || ''}, ${updatedOrder.shippingState || ''} ${updatedOrder.shippingPostalCode || ''}, ${updatedOrder.shippingCountry || ''}`
          : undefined,
      });

      const subjects: Record<string, string> = {
        pending: `Tu pedido ${updatedOrder.orderNumber} está siendo procesado - Tropicolors`,
        paid: `¡Tu pago ha sido confirmado! - Pedido ${updatedOrder.orderNumber} - Tropicolors`,
        sent: `Tu pedido ${updatedOrder.orderNumber} ha sido enviado - Tropicolors`,
        delivered: `Tu pedido ${updatedOrder.orderNumber} ha sido entregado - Tropicolors`,
        failed: `Problema con tu pago - Pedido ${updatedOrder.orderNumber} - Tropicolors`,
      };

      let textContent = "";
      switch (status) {
        case "pending":
          textContent = `Tu pedido ${updatedOrder.orderNumber} está siendo procesado. Te notificaremos cuando tu pago sea confirmado.`;
          break;
        case "paid":
          textContent = `¡Tu pago ha sido confirmado! Tu pedido ${updatedOrder.orderNumber} está siendo preparado para su envío.`;
          break;
        case "sent":
          textContent = `Tu pedido ${updatedOrder.orderNumber} ha sido enviado. ${trackingNumber ? 'Número de rastreo: ' + trackingNumber + ' - Paquetería: ' + shippingCompany : ''}`;
          break;
        case "delivered":
          textContent = `Tu pedido ${updatedOrder.orderNumber} ha sido entregado. ¡Gracias por tu compra en Tropicolors!`;
          break;
        case "failed":
          textContent = `El pago de tu pedido ${updatedOrder.orderNumber} no pudo ser procesado. Por favor contacta al soporte.`;
          break;
        default:
          textContent = `Tu pedido ${updatedOrder.orderNumber} ha sido actualizado.`;
      }

      if (htmlContent) {
        await sendEmailViaBrevoAPI(
          updatedOrder.customerEmail,
          subjects[status] || `Actualización de tu pedido ${updatedOrder.orderNumber} - Tropicolors`,
          htmlContent,
          textContent
        );
        console.log("[Status API] Email notification sent to:", updatedOrder.customerEmail);
      }
    } catch (emailError) {
      console.error("[Status API] Error sending email:", emailError);
      // Don't fail the request if email fails
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ success: false, message: "Error updating order" });
  }
}
