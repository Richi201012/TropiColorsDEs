`import Stripe from "stripe";
import twilio from "twilio";
import nodemailer from "nodemailer";
import { storage } from "./storage";
import type { Order, OrderLineItem, OrderStatus } from "@shared/schema";

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
  notes?: string;
};

export type CheckoutPayload = {
  items: CheckoutItemInput[];
  customer: CheckoutCustomerInput;
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
  customerPhone: string;
  paymentMethod?: string | null;
  items?: OrderLineItem[] | null;
  itemsSummary?: string | null;
  notes?: string | null;
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
    receipt_email: customerEmail,
    description,
    metadata,
  });

  if (!paymentIntent.client_secret) {
    throw new Error(
      "Stripe no devolvio un client_secret. Verifica la configuracion de tu cuenta.",
    );
  }

  try {
    await storage.createOrder({
      orderNumber: orderId,
      paymentIntentId: paymentIntent.id,
      status: "pending",
      amount: amountCents,
      currency: "mxn",
      paymentMethod: payload.paymentMethod ?? "card",
      customerName,
      customerEmail,
      customerPhone,
      notes: payload.customer?.notes,
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("No se pudo guardar la orden en la base de datos:", error);
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
  try {
    order = await storage.getOrderByPaymentIntentId(paymentIntent.id);
  } catch (error) {
    console.error("No se pudo obtener la orden desde la base de datos:", error);
  }

  const receiptUrl = await fetchReceiptUrl(paymentIntent);

  let notificationPayload: OrderNotificationPayload | undefined;

  if (order) {
    let updatedOrder = order;
    try {
      updatedOrder =
        (await storage.updateOrderStatus(paymentIntent.id, "paid", {
          receiptUrl: receiptUrl ?? order.receiptUrl,
        })) ?? order;
    } catch (error) {
      console.error("No se pudo actualizar el estado de la orden:", error);
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
  try {
    order = await storage.getOrderByPaymentIntentId(paymentIntent.id);
  } catch (error) {
    console.error("No se pudo obtener la orden fallida:", error);
  }

  if (order) {
    try {
      await storage.updateOrderStatus(paymentIntent.id, "failed");
    } catch (error) {
      console.error("No se pudo marcar la orden como fallida:", error);
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

async function sendOrderEmails(
  order: OrderNotificationPayload,
  status: OrderStatus,
  receiptUrl?: string,
): Promise<void> {
  if (!emailTransport) {
    console.info("SMTP no configurado. Se omiten correos personalizados.");
    return;
  }

  const subjectPrefix = status === "paid" ? "Pago confirmado" : "Pago fallido";
  const commonBody = [
    `${subjectPrefix} para el pedido ${order.orderNumber}`,
    ``,
    `Total: ${formatCurrencyFromCents(order.amount)}`,
    `Cliente: ${order.customerName}`,
    `Telefono: ${order.customerPhone}`,
    `Correo: ${order.customerEmail}`,
    `Productos:`,
    buildItemsList(order.items, order.itemsSummary),
    order.notes ? `Notas: ${order.notes}` : undefined,
    receiptUrl ? `Recibo Stripe: ${receiptUrl}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  const adminRecipients = adminEmailRecipients
    ?.split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  if (adminRecipients?.length) {
    await emailTransport.sendMail({
      from: emailFrom,
      to: adminRecipients,
      subject: `[Tropicolors] ${subjectPrefix} (${order.orderNumber})`,
      text: commonBody,
    });
  }

  if (status === "paid" && order.customerEmail) {
    const customerBody = [
      `Gracias por tu compra, ${order.customerName}!`,
      "",
      "Estamos procesando tu pedido y en breve nos pondremos en contacto contigo.",
      "",
      `Resumen:`,
      buildItemsList(order.items, order.itemsSummary),
      `Total pagado: ${formatCurrencyFromCents(order.amount)}`,
      receiptUrl ? `Comprobante: ${receiptUrl}` : undefined,
      "",
      "Cualquier duda responde este correo o contactanos por WhatsApp.",
    ]
      .filter(Boolean)
      .join("\n");

    await emailTransport.sendMail({
      from: emailFrom,
      to: order.customerEmail,
      subject: `Confirmacion de pedido ${order.orderNumber} - Tropicolors`,
      text: customerBody,
    });
  }
}
