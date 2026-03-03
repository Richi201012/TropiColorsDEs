import { db } from './firebase.js';
import type { Order, OrderStatus, OrderLineItem } from '../shared/schema.js';

// Firebase Firestore Storage Implementation
export class FirebaseStorage {
  private ordersCollection = db.collection('orders');

  async createOrder(orderData: {
    orderNumber: string;
    paymentIntentId: string;
    status: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerRfc?: string; // RFC para factura
    notes?: string;
    receiptUrl?: string;
    items?: OrderLineItem[];
    shippingAddress?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingPostalCode?: string;
    shippingCountry?: string;
    trackingNumber?: string;
    shippingCompany?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
  }): Promise<Order> {
    const docRef = this.ordersCollection.doc(orderData.orderNumber);
    const now = new Date();
    const order: Order = {
      id: docRef.id,
      orderNumber: orderData.orderNumber,
      paymentIntentId: orderData.paymentIntentId,
      status: orderData.status as OrderStatus,
      amount: orderData.amount,
      currency: orderData.currency,
      paymentMethod: orderData.paymentMethod,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone || "",
      customerRfc: orderData.customerRfc || null,
      notes: orderData.notes || null,
      receiptUrl: orderData.receiptUrl || null,
      items: orderData.items || null,
      shippingAddress: orderData.shippingAddress || null,
      shippingCity: orderData.shippingCity || null,
      shippingState: orderData.shippingState || null,
      shippingPostalCode: orderData.shippingPostalCode || null,
      shippingCountry: orderData.shippingCountry || null,
      trackingNumber: orderData.trackingNumber || null,
      shippingCompany: orderData.shippingCompany || null,
      shippedAt: orderData.shippedAt || null,
      deliveredAt: orderData.deliveredAt || null,
      createdAt: now,
      updatedAt: now,
    };
    
    await docRef.set(order);
    console.log('[Firebase] Order created:', order.orderNumber);
    return order;
  }

  async updateOrderStatus(
    paymentIntentId: string,
    status: OrderStatus,
    data?: Partial<Order>
  ): Promise<Order | undefined> {
    const snapshot = await this.ordersCollection
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      console.log('[Firebase] Order not found for paymentIntentId:', paymentIntentId);
      return undefined;
    }
    
    const docRef = snapshot.docs[0].ref;
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (data) {
      Object.assign(updateData, data);
    }
    
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    return updatedDoc.data() as Order;
  }

  async getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined> {
    const snapshot = await this.ordersCollection
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return undefined;
    }
    
    return snapshot.docs[0].data() as Order;
  }

  async getAllOrders(): Promise<Order[]> {
    const snapshot = await this.ordersCollection
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Order);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const doc = await this.ordersCollection.doc(orderNumber).get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    return doc.data() as Order;
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order | undefined> {
    try {
      const docRef = this.ordersCollection.doc(orderId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        console.log('[Firebase] Order not found:', orderId);
        return undefined;
      }
      
      const updateData: any = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await docRef.update(updateData);
      
      const updatedDoc = await docRef.get();
      return updatedDoc.data() as Order;
    } catch (error) {
      console.error('[Firebase] Error updating order:', error);
      return undefined;
    }
  }
}

export const firebaseStorage = new FirebaseStorage();
