import Stripe from "stripe";
import twilio from "twilio";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { storage } from "./storage.js";
import { simpleStorage } from "./storage-simple.js";
import { firebaseStorage } from "./storage-firebase.js";
import type { Order, OrderLineItem, OrderStatus } from "@shared/schema";

// Función para enviar correo usando la API de Brevo
export async function sendEmailViaBrevoAPI(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  attachment?: { content: string; filename: string; type: string }
): Promise<boolean> {
  // Support both direct env access and Vercel's process.env
  const apiKey = process.env.BREVO_API_KEY || (process as any).env?.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error("[Email] BREVO_API_KEY no configurada - no se puede enviar email");
    console.error("[Email] Variables de entorno disponibles:", Object.keys(process.env).filter(k => k.includes('BREVO') || k.includes('EMAIL')));
    return false;
  }

  // Log first few chars of API key for debugging
  console.log("[Email] Using Brevo API key:", apiKey.substring(0, 10) + "...");
  console.log("[Email] Enviando a:", to);

  try {
    // Build the email payload
    const emailPayload: any = {
      sender: {
        name: "Tropicolors",
        email: "tropicolors20@outlook.es",
      },
      to: [
        {
          email: to,
        }
      ],
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent,
    };
    
    // Add attachment if provided
    if (attachment) {
      emailPayload.attachment = [
        {
          content: attachment.content,
          name: attachment.filename,
        }
      ];
    }
    
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify(emailPayload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Correo enviado vía Brevo API, messageId:", result.messageId);
      return true;
    } else {
      const error = await response.text();
      console.error("Error enviando correo vía Brevo API:", error);
      console.error("Email payload:", JSON.stringify(emailPayload, null, 2));
      return false;
    }
  } catch (error) {
    console.error("Excepción enviando correo vía Brevo API:", error);
    return false;
  }
}

type CheckoutItemInput = {
  id?: number;
  name: string;
  price: number;
  quantity: number;
};

type CheckoutCustomerInput = {
  name?: string;
  email?: string;
  phone?: string;
  rfc?: string; // RFC para factura
  notes?: string;
  // Shipping address
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type CheckoutPayload = {
  items: CheckoutItemInput[];
  customer: CheckoutCustomerInput;
  shipping?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  paymentMethod?: string;
};

export type CheckoutResponse = {
  clientSecret: string;
  orderId: string;
  paymentIntentId: string;
};

type OrderNotificationPayload = {
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerRfc?: string | null; // RFC para factura
  paymentMethod?: string | null;
  items?: OrderLineItem[] | null;
  itemsSummary?: string | null;
  notes?: string | null;
  // Shipping info
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
};

const METADATA_KEYS = {
  itemsJson: "order_items_json",
  itemsSummary: "order_items_summary",
  notes: "order_notes",
} as const;

const MAX_METADATA_LENGTH = 450;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeClient = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const pesoFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const emailTransport =
  process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_PORT
    ? nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: parseInt(process.env.EMAIL_SMTP_PORT ?? "587", 10),
        secure:
          process.env.EMAIL_SMTP_SECURE === "true" ||
          process.env.EMAIL_SMTP_PORT === "465",
        auth:
          process.env.EMAIL_SMTP_USER && process.env.EMAIL_SMTP_PASS
            ? {
                user: process.env.EMAIL_SMTP_USER,
                pass: process.env.EMAIL_SMTP_PASS,
              }
            : undefined,
      })
    : null;

const emailFrom = process.env.EMAIL_FROM ?? "no-reply@tropicolors.mx";
const adminEmailRecipients = process.env.EMAIL_TO;

// Log email transport status at startup
if (emailTransport) {
  console.log("[Email] Transport configured successfully");
  console.log("[Email] Host:", process.env.EMAIL_SMTP_HOST);
  console.log("[Email] Port:", process.env.EMAIL_SMTP_PORT);
  console.log("[Email] From:", emailFrom);
} else {
  console.log("[Email] Transport NOT configured - emails will be skipped");
}

function ensureStripeConfigured() {
  if (!stripeClient) {
    throw new Error(
      "Stripe no esta configurado. Define STRIPE_SECRET_KEY en tus variables de entorno.",
    );
  }
}

export function ensureStripeWebhookConfigured() {
  ensureStripeConfigured();

  if (!stripeWebhookSecret) {
    throw new Error(
      "Stripe Webhook Secret no esta configurado. Agrega STRIPE_WEBHOOK_SECRET a tus variables.",
    );
  }
}

function normalizeItems(items: CheckoutItemInput[]): OrderLineItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Tu carrito esta vacio.");
  }

  const normalized = items
    .map((item) => ({
      id: Number(item.id ?? Date.now()),
      name: String(item.name ?? "").trim(),
      price: Number(item.price),
      quantity: Number(item.quantity ?? 1),
    }))
    .filter(
      (item) => item.name.length > 0 && item.price > 0 && item.quantity > 0,
    );

  if (normalized.length === 0) {
    throw new Error("No pudimos validar los productos del carrito.");
  }

  return normalized;
}

function generateOrderId(): string {
  const randomPart = Math.floor(Math.random() * 9000) + 1000;
  return `TC-${Date.now()}-${randomPart}`;
}

function formatCurrencyFromCents(value: number): string {
  return pesoFormatter.format(value / 100);
}

// Format currency without dividing (for items already in display format)
function formatCurrencyDisplay(value: number): string {
  return pesoFormatter.format(value);
}

function clampMetadataValue(value: string): string {
  return value.length > MAX_METADATA_LENGTH
    ? value.slice(0, MAX_METADATA_LENGTH)
    : value;
}

function buildItemsSummary(items: OrderLineItem[]): string {
  if (!items.length) {
    return "Sin productos registrados";
  }

  return clampMetadataValue(
    items
      .map(
        (item) =>
          `${item.name} x${item.quantity} (${pesoFormatter.format(
            item.price * item.quantity,
          )})`,
      )
      .join(" | "),
  );
}

function serializeItemsForMetadata(items: OrderLineItem[]): {
  json?: string;
  summary: string;
} {
  let subset = [...items];
  let serialized: string | undefined;

  while (subset.length > 0) {
    const candidate = JSON.stringify(subset);
    if (candidate.length <= MAX_METADATA_LENGTH) {
      serialized = candidate;
      break;
    }
    subset = subset.slice(0, subset.length - 1);
  }

  return {
    json: serialized,
    summary: buildItemsSummary(items),
  };
}

function parseItemsFromMetadata(value?: string | null): OrderLineItem[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const normalized = parsed
      .map((item) => ({
        id: Number(item.id ?? Date.now()),
        name: String(item.name ?? "").trim(),
        price: Number(item.price ?? 0),
        quantity: Number(item.quantity ?? 1),
      }))
      .filter(
        (item) => item.name.length > 0 && item.price > 0 && item.quantity > 0,
      );

    return normalized.length ? normalized : null;
  } catch (error) {
    console.warn("No se pudo parsear order_items_json:", error);
    return null;
  }
}

function buildNotificationPayloadFromOrder(order: Order): OrderNotificationPayload {
  return {
    orderNumber: order.orderNumber,
    amount: order.amount,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    paymentMethod: order.paymentMethod,
    items: order.items,
    notes: order.notes,
    // Shipping info
    shippingAddress: (order as any).shippingAddress || null,
    shippingCity: (order as any).shippingCity || null,
    shippingState: (order as any).shippingState || null,
    shippingPostalCode: (order as any).shippingPostalCode || null,
    shippingCountry: (order as any).shippingCountry || null,
  };
}

function buildOrderSnapshotFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
  receiptUrl?: string | null,
): OrderNotificationPayload | undefined {
  const metadata = paymentIntent.metadata ?? {};
  const orderNumber = metadata.orderId ?? paymentIntent.id;
  const customerName =
    metadata.customerName ??
    paymentIntent.shipping?.name ??
    "Cliente Tropicolors";
  const customerEmail =
    metadata.customerEmail ?? paymentIntent.receipt_email ?? "";
  const customerPhone =
    metadata.customerPhone ??
    paymentIntent.shipping?.phone ??
    "Sin telefono";

  if (!customerEmail) {
    return undefined;
  }

  const items =
    parseItemsFromMetadata(metadata[METADATA_KEYS.itemsJson]) ?? null;
  const itemsSummary =
    metadata[METADATA_KEYS.itemsSummary] ??
    (items && items.length ? buildItemsSummary(items) : null);

  return {
    orderNumber,
    amount:
      typeof paymentIntent.amount_received === "number" &&
      paymentIntent.amount_received > 0
        ? paymentIntent.amount_received
        : paymentIntent.amount ?? 0,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod:
      paymentIntent.payment_method_types?.[0] ??
      (typeof paymentIntent.payment_method === "object"
        ? (paymentIntent.payment_method as any)?.type
        : undefined) ??
      "card",
    items,
    itemsSummary,
    notes: metadata[METADATA_KEYS.notes] ?? null,
  };
}

export async function createCheckoutSession(
  payload: CheckoutPayload,
): Promise<CheckoutResponse> {
  ensureStripeConfigured();

  const customerName = payload.customer?.name?.trim();
  const customerEmail = payload.customer?.email?.trim();
  const customerPhone = payload.customer?.phone?.trim();
  const customerRfc = payload.customer?.rfc?.trim() || ""; // RFC para factura

  if (!customerName || !customerEmail || !customerPhone) {
    throw new Error(
      "Nombre, correo y telefono son obligatorios para continuar con el pago.",
    );
  }

  const items = normalizeItems(payload.items);

  const amountCents = items.reduce((total, item) => {
    const lineTotal = Math.round(item.price * 100) * item.quantity;
    return total + lineTotal;
  }, 0);

  if (amountCents <= 0) {
    throw new Error("El total debe ser mayor a $0 MXN.");
  }

  const orderId = generateOrderId();

  const description = `Pedido ${orderId} - Tropicolors`;
  const metadata: Record<string, string> = {
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    customerRfc, // Guardar RFC en metadata
  };

  const itemsMetadata = serializeItemsForMetadata(items);
  if (itemsMetadata.json) {
    metadata[METADATA_KEYS.itemsJson] = itemsMetadata.json;
  }
  if (itemsMetadata.summary) {
    metadata[METADATA_KEYS.itemsSummary] = itemsMetadata.summary;
  }
  if (payload.customer?.notes) {
    metadata[METADATA_KEYS.notes] = clampMetadataValue(
      payload.customer.notes,
    );
  }

  const paymentIntent = await stripeClient!.paymentIntents.create({
    amount: amountCents,
    currency: "mxn",
    automatic_payment_methods: { enabled: true },
    description,
    metadata,
  });

  if (!paymentIntent.client_secret) {
    throw new Error(
      "Stripe no devolvio un client_secret. Verifica la configuracion de tu cuenta.",
    );
  }

  try {
    // Try Firebase storage first, then simple storage
    try {
      await firebaseStorage.createOrder({
        orderNumber: orderId,
        paymentIntentId: paymentIntent.id,
        status: "pending",
        amount: amountCents,
        currency: "mxn",
        paymentMethod: payload.paymentMethod ?? "card",
        customerName,
        customerEmail,
        customerPhone,
        customerRfc, // Agregar RFC
        notes: payload.customer?.notes,
        items,
        shippingAddress: payload.shipping?.street || undefined,
        shippingCity: payload.shipping?.city || undefined,
        shippingState: payload.shipping?.state || undefined,
        shippingPostalCode: payload.shipping?.postalCode || undefined,
        shippingCountry: payload.shipping?.country || undefined,
      });
      console.log("Order saved to Firebase");
    } catch (firebaseError) {
      console.log("Firebase not available, using simple storage:", firebaseError);
      simpleStorage.createOrder({
        orderNumber: orderId,
        paymentIntentId: paymentIntent.id,
        status: "pending" as OrderStatus,
        amount: amountCents,
        currency: "mxn",
        paymentMethod: payload.paymentMethod ?? "card",
        customerName,
        customerEmail,
        customerPhone,
        customerRfc, // Agregar RFC
        notes: payload.customer?.notes,
        items,
        shippingAddress: payload.shipping?.street || undefined,
        shippingCity: payload.shipping?.city || undefined,
        shippingState: payload.shipping?.state || undefined,
        shippingPostalCode: payload.shipping?.postalCode || undefined,
        shippingCountry: payload.shipping?.country || undefined,
      });
    }
  } catch (error) {
    console.error("No se pudo guardar la orden:", error);
  }

  // Enviar correo de confirmación inmediatamente (sin esperar webhook)
  if (customerEmail) {
    try {
      const orderNotification = {
        orderNumber: orderId,
        amount: amountCents,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod: payload.paymentMethod ?? "card",
        items,
        itemsSummary: buildItemsSummary(items),
        notes: payload.customer?.notes,
        // Shipping info for email
        shippingAddress: payload.shipping?.street || undefined,
        shippingCity: payload.shipping?.city || undefined,
        shippingState: payload.shipping?.state || undefined,
        shippingPostalCode: payload.shipping?.postalCode || undefined,
        shippingCountry: payload.shipping?.country || undefined,
      };
      await sendOrderEmails(orderNotification, "paid", undefined);
    } catch (error) {
      console.error("Error enviando correo de confirmación:", error);
    }
  }

  return {
    clientSecret: paymentIntent.client_secret,
    orderId,
    paymentIntentId: paymentIntent.id,
  };
}

export function constructStripeEvent(
  rawBody: Buffer | string,
  signature: string | string[] | undefined,
): Stripe.Event {
  ensureStripeWebhookConfigured();

  if (!signature || Array.isArray(signature)) {
    throw new Error("Stripe no envio la firma del webhook.");
  }

  const bodyBuffer = Buffer.isBuffer(rawBody)
    ? rawBody
    : Buffer.from(rawBody ?? "", "utf-8");

  return stripeClient!.webhooks.constructEvent(
    bodyBuffer,
    signature,
    stripeWebhookSecret!,
  );
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent,
      );
      break;
    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent,
      );
      break;
    default:
      break;
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  let order: Order | undefined;
  
  // Try to get order from Firebase first, then simple storage
  try {
    order = await firebaseStorage.getOrderByPaymentIntentId(paymentIntent.id);
  } catch (error) {
    console.log("Firebase not available, trying simple storage:", error);
    order = simpleStorage.getOrderByPaymentIntent(paymentIntent.id);
  }

  const receiptUrl = await fetchReceiptUrl(paymentIntent);

  let notificationPayload: OrderNotificationPayload | undefined;

  if (order) {
    let updatedOrder = order;
    
    // Try to update in Firebase first, then simple storage
    try {
      updatedOrder = await firebaseStorage.updateOrderStatus(paymentIntent.id, "paid", {
        receiptUrl: receiptUrl ?? order.receiptUrl,
      }) ?? order;
    } catch (error) {
      console.log("Firebase not available, using simple storage:", error);
      updatedOrder = simpleStorage.updateOrderStatus(paymentIntent.id, "paid", {
        receiptUrl: receiptUrl ?? order.receiptUrl,
      }) ?? order;
    }

    notificationPayload = buildNotificationPayloadFromOrder(updatedOrder);
  } else {
    console.warn(
      `No se encontro la orden para el PaymentIntent ${paymentIntent.id}. Se usaran los metadatos para notificar.`,
    );
    notificationPayload = buildOrderSnapshotFromPaymentIntent(
      paymentIntent,
      receiptUrl,
    );
  }

  if (!notificationPayload) {
    console.warn(
      `No se pudo reconstruir la orden del PaymentIntent ${paymentIntent.id}`,
    );
    return;
  }

  await Promise.all([
    sendWhatsAppNotification(notificationPayload, receiptUrl ?? undefined),
    sendOrderEmails(notificationPayload, "paid", receiptUrl ?? undefined),
  ]);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  let order: Order | undefined;
  
  // Try to get order from Firebase first, then simple storage
  try {
    order = await firebaseStorage.getOrderByPaymentIntentId(paymentIntent.id);
  } catch (error) {
    console.log("Firebase not available, trying simple storage:", error);
    order = simpleStorage.getOrderByPaymentIntent(paymentIntent.id);
  }

  if (order) {
    // Try to update in Firebase first, then simple storage
    try {
      await firebaseStorage.updateOrderStatus(paymentIntent.id, "failed");
    } catch (error) {
      console.log("Firebase not available, using simple storage:", error);
      simpleStorage.updateOrderStatus(paymentIntent.id, "failed");
    }
    await sendOrderEmails(order, "failed");
    return;
  }

  const snapshot = buildOrderSnapshotFromPaymentIntent(paymentIntent);
  if (snapshot) {
    await sendOrderEmails(snapshot, "failed");
  } else {
    console.warn(
      `Intento fallido pero sin informacion suficiente del PaymentIntent ${paymentIntent.id}`,
    );
  }
}

async function fetchReceiptUrl(
  paymentIntent: Stripe.PaymentIntent,
): Promise<string | null> {
  if (!stripeClient) {
    return null;
  }

  const latestChargeId =
    typeof paymentIntent.latest_charge === "string"
      ? paymentIntent.latest_charge
      : paymentIntent.latest_charge?.id;

  if (!latestChargeId) {
    return null;
  }

  const charge = await stripeClient.charges.retrieve(latestChargeId);
  if ("receipt_url" in charge && charge.receipt_url) {
    return charge.receipt_url;
  }

  return null;
}

function buildItemsList(
  items: OrderLineItem[] | null | undefined,
  fallbackSummary?: string | null,
): string {
  if (items && items.length > 0) {
    return items
      .map(
        (item) =>
          `- ${item.name} x${item.quantity} - ${pesoFormatter.format(
            item.price * item.quantity,
          )}`,
      )
      .join("\n");
  }

  if (fallbackSummary && fallbackSummary.length > 0) {
    return fallbackSummary;
  }

  return "Sin productos registrados";
}

async function sendWhatsAppNotification(
  order: OrderNotificationPayload,
  receiptUrl?: string,
): Promise<void> {
  if (
    !twilioClient ||
    !process.env.TWILIO_WHATSAPP_FROM ||
    !process.env.WHATSAPP_ADMIN_NUMBER
  ) {
    console.info("Twilio no esta configurado. Se omite WhatsApp.");
    return;
  }

  const from = process.env.TWILIO_WHATSAPP_FROM.startsWith("whatsapp:")
    ? process.env.TWILIO_WHATSAPP_FROM
    : `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

  const to = process.env.WHATSAPP_ADMIN_NUMBER.startsWith("whatsapp:")
    ? process.env.WHATSAPP_ADMIN_NUMBER
    : `whatsapp:${process.env.WHATSAPP_ADMIN_NUMBER}`;

  const message = [
    "Nuevo pago confirmado",
    `Pedido: ${order.orderNumber}`,
    `Total: ${formatCurrencyFromCents(order.amount)}`,
    `Cliente: ${order.customerName} (${order.customerPhone})`,
    `Correo: ${order.customerEmail}`,
    `Productos:\n${buildItemsList(order.items, order.itemsSummary)}`,
    receiptUrl ? `Recibo: ${receiptUrl}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  await twilioClient.messages.create({
    from,
    to,
    body: message,
  });
}

/**
 * Genera el HTML del correo de confirmación de pedido
 * usando la plantilla email-templates/purchase-confirmation.html
 * 
 * Esta plantilla incluye:
 * - Header con logo, color de marca, título y subtítulo
 * - Confirmación de pedido con número, fecha, método de pago y estado
 * - Información de envío en dos columnas (desktop) / una columna (móvil)
 * - Resumen de productos con imágenes
 * - Resumen de pago con totales
 * - CTA principal y secundario
 * - Sección de confianza
 * - Footer con redes sociales y datos legales
 */
function generateOrderConfirmationEmailHTML(order: OrderNotificationPayload): string {
  try {
    // Usar la plantilla existente que funciona
    const templatePath = path.join(process.cwd(), "email-templates", "order-confirmation-new.html");
    console.log("Buscando plantilla en:", templatePath);
    
    if (!fs.existsSync(templatePath)) {
      console.error("Plantilla no encontrada:", templatePath);
      return "";
    }
    
    let template = fs.readFileSync(templatePath, "utf-8");
    console.log("Plantilla leída, longitud:", template.length);

    // Calcular totales
    // Los precios de items están en pesos (ej: 380 = $380)
    // NO dividir por 100 para items - ya están en formato pesos
    // El order.amount está en centavos, SÍ dividir por 100
    const items = order.items || [];
    
    // Calcular subtotal desde items (precios ya en pesos)
    const itemsSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Shipping en centavos - convertir a pesos para cálculos
    const shippingCostCents = 7500; // $75.00 en centavos
    const shippingCostPesos = shippingCostCents / 100;
    
    // Calcular taxes en centavos
    const taxRate = 0.16;
    const subtotalWithShipping = itemsSubtotal + shippingCostPesos;
    const taxesCents = Math.round(subtotalWithShipping * taxRate * 100); // guardar en centavos
    
    // Total en centavos
    const totalCents = order.amount || (itemsSubtotal * 100 + shippingCostCents + taxesCents);

    // Formatear fecha
    const orderDate = new Date().toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",", "");

    // Obtener método de pago
    const paymentMethodDisplay = order.paymentMethod === "card" ? "Visa •••• 4242" : order.paymentMethod || "Tarjeta";

    // Obtener datos de envío separados
    const shippingState = order.shippingState || "";
    const shippingPostalCode = order.shippingPostalCode || "";
    const shippingCountry = order.shippingCountry || "México";
    const currentYear = new Date().getFullYear().toString();
    
    // URLs
    const baseUrl = process.env.BASE_URL || "https://tropicolors.mx";
    const orderUrl = `${baseUrl}/pedido/${order.orderNumber}`;
    const shopUrl = baseUrl;
    const privacyPolicyUrl = `${baseUrl}/privacidad`;
    const unsubscribeUrl = `${baseUrl}/unsubscribe`;

    // Reemplazar placeholders básicos
    template = template
      .replace(/{{customer_name}}/g, order.customerName || "Cliente")
      .replace(/{{customer_email}}/g, order.customerEmail || "")
      .replace(/{{order_number}}/g, order.orderNumber || "N/A")
      .replace(/{{order_date}}/g, orderDate)
      .replace(/{{payment_method}}/g, paymentMethodDisplay)
      .replace(/{{subtotal}}/g, formatCurrencyDisplay(itemsSubtotal))
      .replace(/{{shipping_cost}}/g, formatCurrencyDisplay(shippingCostPesos))
      .replace(/{{tax}}/g, formatCurrencyDisplay(taxesCents / 100))
      .replace(/{{total}}/g, formatCurrencyFromCents(totalCents))
      .replace(/{{order_url}}/g, orderUrl)
      .replace(/{{shop_url}}/g, shopUrl)
      .replace(/{{customer_phone}}/g, order.customerPhone || "Información no disponible")
      .replace(/{{customer_rfc}}/g, order.customerRfc || "No proporcionado")
      .replace(/{{shipping_address}}/g, order.shippingAddress || "Información no disponible")
      .replace(/{{shipping_city}}/g, order.shippingCity || "Información no disponible")
      .replace(/{{shipping_state}}/g, shippingState)
      .replace(/{{shipping_postal_code}}/g, shippingPostalCode)
      .replace(/{{shipping_country}}/g, shippingCountry)
      .replace(/{{current_year}}/g, currentYear)
      .replace(/{{privacy_policy_url}}/g, privacyPolicyUrl)
      .replace(/{{unsubscribe_url}}/g, unsubscribeUrl);

    console.log("Después de reemplazos básicos, longitud:", template.length);
    console.log("Items:", JSON.stringify(items));

    // Generar HTML de productos para la nueva plantilla (con imágenes)
    const productsRowsHTML = items.map(item => {
      // Placeholder image - in production, add image field to OrderLineItem schema
      const productImage = "https://i.imgur.com/product-placeholder.jpg";
      
      return `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 1px solid #e2e8f0;">
        <tr>
          <td style="padding: 15px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="product-image-col" style="vertical-align: middle; padding-right: 15px; width: 70px;">
                  <img src="${productImage}" alt="${item.name}" width="60" height="60" style="display: block; border-radius: 8px; background-color: #f1f5f9; width: 60px; height: 60px; object-fit: cover;">
                </td>
                <td class="mobile-stack" style="vertical-align: middle;">
                  <p style="margin: 0 0 5px; color: #1e293b; font-size: 14px; font-weight: 600;">${item.name}</p>
                </td>
                <td class="mobile-stack mobile-center" style="vertical-align: top; text-align: right; width: 80px;">
                  <p style="margin: 0 0 5px; color: #1e293b; font-size: 14px; font-weight: 600;">${formatCurrencyDisplay(item.price * item.quantity)}</p>
                  <p style="margin: 0; color: #64748b; font-size: 13px;">Cant: ${item.quantity}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
    }).join("");

    // Reemplazar la sección de productos
    template = template.replace(/{{products_html}}/g, productsRowsHTML);

    console.log("HTML generado correctamente, longitud:", template.length);
    
    return template;
  } catch (error) {
    console.error("Error leyendo plantilla HTML:", error);
    return "";
  }
}

async function sendOrderEmails(
  order: OrderNotificationPayload,
  status: OrderStatus,
  receiptUrl?: string,
): Promise<void> {
  if (!emailTransport) {
    console.info("SMTP no configurado. Se omiten correos personalizados.");
    return;
  }

  // Solo enviar correo al cliente cuando el pago está confirmado
  if (status !== "paid" || !order.customerEmail) {
    console.log("Correo no enviado: status =", status, ", email =", order.customerEmail);
    return;
  }

  // Generar HTML de la plantilla
  const htmlContent = generateOrderConfirmationEmailHTML(order);
  
  if (!htmlContent || htmlContent.length < 100) {
    console.error("Error: No se pudo generar el HTML del correo");
    return;
  }

  console.log("Enviando correo HTML al cliente, longitud:", htmlContent.length);
  console.log("Primeros 200 caracteres del HTML:", htmlContent.substring(0, 200));
  console.log("DEBUG - Enviando a:", order.customerEmail);
  console.log("DEBUG - Asunto:", `Confirmacion de pedido ${order.orderNumber} - Tropicolors`);

  // Generar versión de texto plano del correo
  const textContent = `Gracias por tu compra, ${order.customerName}!\n\nTu pedido ${order.orderNumber} ha sido confirmado.\n\nEstamos preparando tu pedido y te notifycaremos cuando sea enviado.`;

  // Enviar correo usando la API de Brevo
  const success = await sendEmailViaBrevoAPI(
    order.customerEmail,
    `Confirmacion de pedido ${order.orderNumber} - Tropicolors`,
    htmlContent,
    textContent
  );

  if (success) {
    console.log("Correo enviado exitosamente a:", order.customerEmail);
  } else {
    console.error("Error al enviar correo a:", order.customerEmail);
  }
}

type StatusNotificationPayload = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  trackingNumber?: string;
  shippingCompany?: string;
  shippingAddress?: string;
};

// Función para generar el HTML del correo de cambio de estado
// Genera contenido específico para cada estado
export function generateOrderStatusEmailHTML(order: StatusNotificationPayload): string {
  const templatePath = path.join(process.cwd(), "email-templates", "order-status-notification.html");
  
  if (!fs.existsSync(templatePath)) {
    console.error("Plantilla no encontrada:", templatePath);
    return ""
  }
  
  let template = fs.readFileSync(templatePath, "utf-8");
  const status = order.status;
  
  // Contenido específico para cada estado
  const statusContents: Record<string, string> = {
    pending: `
      <h1 class="title">Tu pedido está siendo procesado</h1>
      <div style="text-align: center;">
        <span class="status-icon">⏳</span><br>
        <span class="status-badge status-pending">Pendiente de pago</span>
      </div>
      <p class="subtitle">
        Hola <strong>${order.customerName || 'Cliente'}</strong>, tu pedido ha sido recibido y está esperando confirmación del pago.
      </p>
      <p class="subtitle">
        Te notificaremos cuando tu pago sea confirmado.
      </p>
      <div class="info-box">
        <div class="info-detail">
          <span class="info-label">Número de pedido:</span> ${order.orderNumber}
        </div>
        ${order.shippingAddress ? `
        <div class="info-detail">
          <span class="info-label">Dirección de envío:</span> ${order.shippingAddress}
        </div>` : ''}
      </div>`,

    paid: `
      <h1 class="title">¡Tu pago ha sido confirmado!</h1>
      <div style="text-align: center;">
        <span class="status-icon">✅</span><br>
        <span class="status-badge status-paid">Pago Confirmado</span>
      </div>
      <p class="subtitle">
        Hola <strong>${order.customerName || 'Cliente'}</strong>, ¡excelentes noticias! Tu pago ha sido procesado exitosamente.
      </p>
      <p class="subtitle">
        Ahora estamos preparando tu pedido para enviarlo. Te informaremos cuando esté en camino.
      </p>
      <div class="info-box">
        <div class="info-detail">
          <span class="info-label">Número de pedido:</span> ${order.orderNumber}
        </div>
        ${order.shippingAddress ? `
        <div class="info-detail">
          <span class="info-label">Dirección de envío:</span> ${order.shippingAddress}
        </div>` : ''}
      </div>`,

    sent: `
      <h1 class="title">¡Tu pedido ha sido enviado!</h1>
      <div style="text-align: center;">
        <span class="status-icon">📦</span><br>
        <span class="status-badge status-sent">Pedido Enviado</span>
      </div>
      <p class="subtitle">
        Hola <strong>${order.customerName || 'Cliente'}</strong>, ¡tu pedido está en camino!
      </p>
      ${order.trackingNumber ? `
      <div class="tracking-box">
        <div class="tracking-title">📱 Información de Rastreo</div>
        <div class="tracking-number">${order.trackingNumber}</div>
        ${order.shippingCompany ? `<div class="tracking-company">Paquetería: ${order.shippingCompany}</div>` : ''}
        <p style="font-size: 12px; color: #666666; margin-top: 15px;">
          Puedes rastrear tu paquete en el sitio de la paquetería
        </p>
      </div>` : ''}
      <p class="subtitle">
        Tu pedido ya está en camino. Pronto recibirás tu producto en la dirección de envío proporcionada.
      </p>
      <div class="info-box">
        <div class="info-detail">
          <span class="info-label">Número de pedido:</span> ${order.orderNumber}
        </div>
        ${order.shippingAddress ? `
        <div class="info-detail">
          <span class="info-label">Dirección de envío:</span> ${order.shippingAddress}
        </div>` : ''}
      </div>`,

    delivered: `
      <h1 class="title">¡Tu pedido ha sido entregado!</h1>
      <div style="text-align: center;">
        <span class="status-icon">🎉</span><br>
        <span class="status-badge status-delivered">Entregado</span>
      </div>
      <p class="subtitle">
        Hola <strong>${order.customerName || 'Cliente'}</strong>, ¡tu pedido ha sido entregado exitosamente!
      </p>
      <p class="subtitle">
        Esperamos que disfrutes tu producto. Gracias por tu compra en Tropicolors.
      </p>
      <div class="info-box">
        <div class="info-detail">
          <span class="info-label">¿Todo bien con tu pedido?</span>
        </div>
        <div class="info-detail" style="font-size: 13px; color: #666666;">
          Si tienes alguna duda o problema, no dudes en contactarnos. Estamos para ayudarte.
        </div>
      </div>
      <div class="info-box" style="background-color: #fff3cd; border: 1px solid #ffc107;">
        <div class="info-detail" style="color: #856404;">
          <span class="info-label">📄 ¿Necesitas factura?</span>
        </div>
        <div class="info-detail" style="font-size: 13px; color: #856404;">
          Si requieres factura, por favor envianos un mensaje por WhatsApp indicando tu número de pedido: <strong>${order.orderNumber}</strong>
        </div>
        <div style="text-align: center; margin-top: 15px;">
          <a href="https://wa.me/525551146856?text=Hola,%20necesito%20factura%20para%20mi%20pedido%20${order.orderNumber}" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Solicitar Factura por WhatsApp
          </a>
        </div>
      </div>
      <div class="info-box">
        <div class="info-detail">
          <span class="info-label">Número de pedido:</span> ${order.orderNumber}
        </div>
      </div>`,

    failed: `
      <h1 class="title">Problema con tu pago</h1>
      <div style="text-align: center;">
        <span class="status-icon">❌</span><br>
        <span class="status-badge status-failed">Pago Fallido</span>
      </div>
      <p class="subtitle">
        Hola <strong>${order.customerName || 'Cliente'}</strong>, lamentamos informarte que el pago de tu pedido no pudo ser procesado.
      </p>
      <p class="subtitle">
        Por favor verifica los datos de tu tarjeta e intenta nuevamente, o contacta a tu banco.
      </p>
      <div class="info-box">
        <div class="info-detail">
          <span class="info-label">¿Necesitas ayuda?</span>
        </div>
        <div class="info-detail" style="font-size: 13px; color: #666666;">
          Contáctanos por WhatsApp o email y con gusto te ayudaremos a completar tu compra.
        </div>
      </div>
      <div class="info-box">
        <div class="info-detail">
          <span class="info-label">Número de pedido:</span> ${order.orderNumber}
        </div>
      </div>`,
  };
  
  const statusContent = statusContents[status] || statusContents.pending;
  const orderUrl = process.env.BASE_URL ? `${process.env.BASE_URL}/pedido/${order.orderNumber}` : "https://tropicolors.mx";
  const currentYear = new Date().getFullYear().toString();
  
  // Reemplazar los placeholders
  template = template
    .replace(/{{STATUS_CONTENT}}/g, statusContent)
    .replace(/{{orderNumber}}/g, order.orderNumber || "N/A")
    .replace(/{{customerName}}/g, order.customerName || "Cliente")
    .replace(/{{shippingAddress}}/g, order.shippingAddress || "")
    .replace(/{{trackingNumber}}/g, order.trackingNumber || "")
    .replace(/{{shippingCompany}}/g, order.shippingCompany || "")
    .replace(/{{orderUrl}}/g, orderUrl)
    .replace(/{{CURRENT_YEAR}}/g, currentYear);
  
  // Agregar botón CTA
  const ctaButton = `<div style="text-align: center;">
    <a href="${orderUrl}" class="cta-button">Ver detalles del pedido</a>
  </div>`;
  
  // Insertar CTA antes del footer
  template = template.replace(
    '</div>\n            \n            <div class="email-footer">',
    `</div>
            ${ctaButton}
            <p style="text-align: center; color: #999999; font-size: 13px; margin-top: 25px;">
              Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
            </p>
            \n            <div class="email-footer">`
  );
  
  return template;
}
