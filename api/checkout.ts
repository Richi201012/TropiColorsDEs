import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createCheckoutSession } from "../server/payments";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Stripe-Signature");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const result = await createCheckoutSession(payload);
    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error en /api/checkout:", error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "No se pudo iniciar el pago.",
    });
  }
}
