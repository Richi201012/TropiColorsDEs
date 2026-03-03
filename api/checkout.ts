import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createCheckoutSession } from "../server/payments.js";

// Secure CORS: Allow only specific origins in production
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"];

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.some(allowed => 
    allowed === "*" || 
    allowed === origin || 
    (allowed.endsWith("/*") && origin.startsWith(allowed.slice(0, -2)))
  )) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Stripe-Signature");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);

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
