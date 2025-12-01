import {
  type User,
  type InsertUser,
  type ContactMessage,
  type InsertContactMessage,
  type Order,
  type InsertOrder,
  type OrderStatus,
  users,
  contactMessages,
  orders,
} from "../shared/schema.js";
import { db } from "./db";
import { eq } from "drizzle-orm";

function assertDb() {
  if (!db) {
    throw new Error(
      "La base de datos no esta configurada. Define DATABASE_URL para habilitar el almacenamiento.",
    );
  }
  return db;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(
    paymentIntentId: string,
    status: OrderStatus,
    data?: Partial<InsertOrder>
  ): Promise<Order | undefined>;
  getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const database = assertDb();
    const [user] = await database.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const database = assertDb();
    const [user] = await database
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const database = assertDb();
    const [user] = await database.insert(users).values(insertUser).returning();
    return user;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const database = assertDb();
    const [contactMessage] = await database
      .insert(contactMessages)
      .values(message)
      .returning();
    return contactMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const database = assertDb();
    return await database
      .select()
      .from(contactMessages)
      .orderBy(contactMessages.createdAt);
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const database = assertDb();
    const [order] = await database.insert(orders).values(orderData).returning();
    return order;
  }

  async updateOrderStatus(
    paymentIntentId: string,
    status: OrderStatus,
    data?: Partial<InsertOrder>
  ): Promise<Order | undefined> {
    const database = assertDb();
    const [order] = await database
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
        ...(data ?? {}),
      })
      .where(eq(orders.paymentIntentId, paymentIntentId))
      .returning();
    return order;
  }

  async getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined> {
    const database = assertDb();
    const [order] = await database
      .select()
      .from(orders)
      .where(eq(orders.paymentIntentId, paymentIntentId));
    return order;
  }
}

export const storage = new DatabaseStorage();
