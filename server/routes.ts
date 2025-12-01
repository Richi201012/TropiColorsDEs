import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import {
  createCheckoutSession,
  constructStripeEvent,
  handleStripeEvent,
  ensureStripeWebhookConfigured,
} from "./payments";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/checkout", async (req, res) => {
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

  app.post("/api/contact", async (req, res) => {
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

  return httpServer;
}
