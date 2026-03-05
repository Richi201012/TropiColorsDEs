import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getInvoices } from "../server/services/invoice-firebase.service.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const invoices = await getInvoices();
    return res.json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.status(500).json({ success: false, message: "Error fetching invoices" });
  }
}
