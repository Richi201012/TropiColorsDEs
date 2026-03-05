import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendInvoice } from "../server/services/invoice-firebase.service.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // Get invoice ID from request body or query
    let invoiceId = "";
    if (req.body && typeof req.body === "object") {
      invoiceId = (req.body as any).id || (req.body as any).invoiceId || "";
    }
    if (!invoiceId && req.query && typeof req.query === "object") {
      invoiceId = (req.query as any).id || (req.query as any).invoiceId || "";
    }

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: "Missing invoice ID" });
    }

    console.log("Sending invoice:", invoiceId);
    const result = await sendInvoice(invoiceId);
    return res.json(result);
  } catch (error) {
    console.error("Error sending invoice:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Error sending invoice" 
    });
  }
}
