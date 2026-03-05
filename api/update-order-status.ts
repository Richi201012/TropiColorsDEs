import type { VercelRequest, VercelResponse } from "@vercel/node";
import { firebaseStorage } from "../server/storage-firebase.js";
import { simpleStorage } from "../server/storage-simple.js";

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

    return res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ success: false, message: "Error updating order" });
  }
}
