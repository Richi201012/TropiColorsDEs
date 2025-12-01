import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  constructStripeEvent,
  ensureStripeWebhookConfigured,
  handleStripeEvent,
} from "../server/payments";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readBuffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as any as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    ensureStripeWebhookConfigured();
    const rawBody = await readBuffer(req);
    const signature = req.headers["stripe-signature"];
    const event = constructStripeEvent(rawBody, signature);
    await handleStripeEvent(event);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error (Vercel):", error);
    return res.status(400).send(
      error instanceof Error
        ? `Webhook Error: ${error.message}`
        : "Webhook Error",
    );
  }
}
