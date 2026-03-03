import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type OrderLineItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").notNull().unique(),
  paymentIntentId: varchar("payment_intent_id").notNull().unique(),
  status: varchar("status").notNull().default("pending"),
  amount: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("mxn"),
  paymentMethod: varchar("payment_method", { length: 50 }).default("card"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  customerRfc: text("customer_rfc"), // RFC para factura
  // Shipping address fields
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingPostalCode: text("shipping_postal_code"),
  shippingCountry: text("shipping_country"),
  // Tracking information
  trackingNumber: varchar("tracking_number", { length: 100 }),
  shippingCompany: varchar("shipping_company", { length: 100 }),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  receiptUrl: text("receipt_url"),
  items: jsonb("items").$type<OrderLineItem[] | null>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderStatus = "pending" | "paid" | "failed" | "sent" | "delivered";

// ============================================
// INVOICE SYSTEM - Facturación SaaS
// ============================================

/**
 * Conceptos de una factura
 * Cada concepto representa un item/servicio facturado
 */
export const invoiceConcepts = pgTable("invoice_concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(), // Cantidad (entero)
  unitPrice: integer("unit_price").notNull(), // Precio unitario en centavos
  amount: integer("amount").notNull(), // Importe total (cantidad * precio)
  createdAt: timestamp("created_at").defaultNow(),
});

export type InvoiceConcept = typeof invoiceConcepts.$inferSelect;
export type InsertInvoiceConcept = typeof invoiceConcepts.$inferInsert;

/**
 * Estados de una factura
 */
export type InvoiceStatus = "pendiente" | "enviada" | "pagada" | "fallida";

/**
 * Tabla principal de facturas
 * Almacena todos los datos necesarios para una factura profesional
 */
export const invoices = pgTable("invoices", {
  // Identificador
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number", { length: 20 }).notNull().unique(),
  
  // Datos del emisor (empresa que factura)
  issuerName: text("issuer_name").notNull(),
  issuerRFC: varchar("issuer_rfc", { length: 13 }).notNull(),
  issuerAddress: text("issuer_address").notNull(),
  issuerEmail: text("issuer_email").notNull(),
  issuerPhone: varchar("issuer_phone", { length: 20 }),
  
  // Datos del cliente
  customerName: text("customer_name").notNull(),
  customerRFC: varchar("customer_rfc", { length: 13 }).notNull(),
  customerEmail: text("customer_email").notNull(),
  customerAddress: text("customer_address").notNull(),
  
  // Cálculos financieros (todos en centavos para precisión)
  subtotal: integer("subtotal").notNull(),
  taxRate: integer("tax_rate").notNull().default(16), // Porcentaje de IVA (0-100)
  taxAmount: integer("tax_amount").notNull(),
  total: integer("total").notNull(),
  
  // Moneda
  currency: varchar("currency", { length: 3 }).notNull().default("MXN"),
  
  // Estado y metadata
  status: varchar("status", { length: 20 }).notNull().default("pendiente"),
  notes: text("notes"), // Notas adicionales en la factura
  
  // Rutas de archivos
  pdfPath: text("pdf_path"), // Ruta donde se guardó el PDF
  
  // Fechas
  sentAt: timestamp("sent_at"), // Fecha de envío por email
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Schema de creación de factura (para validación)
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceNumber: true,
  subtotal: true,
  taxAmount: true,
  total: true,
  status: true,
  pdfPath: true,
  sentAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Schema para los conceptos
  items: z.array(z.object({
    description: z.string().min(1, "La descripción es requerida"),
    quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
    unitPrice: z.number().int().positive("El precio debe ser mayor a 0"),
  })).min(1, "Debe agregar al menos un concepto"),
  
  // Tax rate con valor por defecto
  taxRate: z.number().int().min(0).max(100).default(16),
  
  // Opciones adicionales
  sendEmail: z.boolean().default(false),
  notes: z.string().optional(),
});

// Tipo inferido
export type InsertInvoiceInput = z.infer<typeof insertInvoiceSchema>;
