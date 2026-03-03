import type { Order, OrderStatus, OrderLineItem } from "../shared/schema.js";

// In-memory storage for orders (fallback when no database)
const ordersMap = new Map<string, Order>();
let orderCounter = 1;

// Helper to find order by ID or orderNumber
export function findOrderById(orderId: string): Order | undefined {
  // First try exact ID match
  if (ordersMap.has(orderId)) {
    return ordersMap.get(orderId);
  }
  // Then try orderNumber match
  return Array.from(ordersMap.values()).find(
    (order) => order.orderNumber === orderId
  );
}

export const simpleStorage = {
  createOrder(orderData: {
    orderNumber: string;
    paymentIntentId: string;
    status: OrderStatus;
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
  }): Order {
    const id = `order_${orderCounter++}_${Date.now()}`;
    const now = new Date();
    
    const order: Order = {
      id,
      orderNumber: orderData.orderNumber,
      paymentIntentId: orderData.paymentIntentId,
      status: orderData.status,
      amount: orderData.amount,
      currency: orderData.currency,
      paymentMethod: orderData.paymentMethod || null,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone || null,
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
    
    ordersMap.set(id, order);
    return order;
  },

  updateOrderStatus(
    paymentIntentId: string,
    status: OrderStatus,
    data?: Partial<Order>
  ): Order | undefined {
    const orders = Array.from(ordersMap.values());
    for (const order of orders) {
      if (order.paymentIntentId === paymentIntentId) {
        order.status = status;
        order.updatedAt = new Date();
        if (data) {
          Object.assign(order, data);
        }
        return order;
      }
    }
    return undefined;
  },

  getOrderByPaymentIntent(paymentIntentId: string): Order | undefined {
    const orders = Array.from(ordersMap.values());
    return orders.find((order) => order.paymentIntentId === paymentIntentId);
  },

  getOrder(orderNumber: string): Order | undefined {
    return Array.from(ordersMap.values()).find(
      (order) => order.orderNumber === orderNumber
    );
  },

  getAllOrders(): Order[] {
    return Array.from(ordersMap.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  },

  deleteOrder(orderNumber: string): boolean {
    const orders = Array.from(ordersMap.entries());
    for (const [id, order] of orders) {
      if (order.orderNumber === orderNumber) {
        ordersMap.delete(id);
        return true;
      }
    }
    return false;
  },

  // Get order by ID or orderNumber
  getOrderById(orderId: string): Order | undefined {
    return findOrderById(orderId);
  },

  // Update order by ID or orderNumber
  updateOrder(orderId: string, updates: Partial<Order>): Order | undefined {
    const order = findOrderById(orderId);
    if (!order) return undefined;
    
    Object.assign(order, updates);
    order.updatedAt = new Date();
    return order;
  },
};
