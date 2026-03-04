import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Copy
} from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string | null;
  receiptUrl: string | null;
  items: OrderItem[];
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  createdAt: { _seconds: number; _nanoseconds?: number };
  trackingNumber: string | null;
  shippingCompany: string | null;
  shippedAt: { _seconds: number; _nanoseconds?: number } | null;
  deliveredAt: { _seconds: number; _nanoseconds?: number } | null;
  status: string;
  updatedAt: { _seconds: number; _nanoseconds?: number };
  customerRfc?: string;
}

interface OrderModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusFlow = [
  { id: "pending", label: "Creado", icon: Clock, color: "bg-gray-500" },
  { id: "paid", label: "Pagado", icon: CreditCard, color: "bg-blue-500" },
  { id: "sent", label: "Enviado", icon: Truck, color: "bg-yellow-500" },
  { id: "delivered", label: "Entregado", icon: CheckCircle, color: "bg-green-500" },
];

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-blue-100 text-blue-700",
  sent: "bg-yellow-100 text-yellow-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

function formatCurrency(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(ts: { _seconds: number }) {
  return new Date(ts._seconds * 1000).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function OrderModal({ order, open, onOpenChange }: OrderModalProps) {
  if (!order) return null;

  const currentStatusIndex = statusFlow.findIndex(s => s.id === order.status);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Pedido #{order.orderNumber}
                <button 
                  onClick={() => copyToClipboard(order.orderNumber)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </DialogTitle>
              <DialogDescription className="mt-1">
                {formatDate(order.createdAt)}
              </DialogDescription>
            </div>
            <Badge className={`${statusColors[order.status]} px-3 py-1`}>
              {order.status === "pending" && "Pendiente"}
              {order.status === "paid" && "Pagado"}
              {order.status === "sent" && "Enviado"}
              {order.status === "delivered" && "Entregado"}
              {order.status === "failed" && "Cancelado"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Status Timeline */}
        <div className="my-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Estado del Pedido</h4>
          <div className="flex items-center justify-between">
            {statusFlow.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={status.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${status.color} flex items-center justify-center ${isCompleted ? 'opacity-100' : 'opacity-30'}`}>
                      <status.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs mt-1 ${isCurrent ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {status.label}
                    </span>
                  </div>
                  {index < statusFlow.length - 1 && (
                    <div className={`w-16 h-1 mx-2 rounded ${index < currentStatusIndex ? status.color : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Customer Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Información del Cliente
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{order.customerEmail}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{order.customerPhone}</span>
              </div>
            )}
            {order.customerRfc && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">RFC: {order.customerRfc}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        {(order.shippingAddress || order.shippingCity) && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dirección de Envío
            </h4>
            <p className="text-sm text-gray-600">
              {order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}, {order.shippingCountry}
            </p>
          </div>
        )}

        {/* Shipping Info */}
        {(order.trackingNumber || order.shippingCompany) && (
          <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Información de Envío
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {order.shippingCompany && (
                <div>
                  <span className="text-yellow-700">Paquetería:</span>
                  <span className="ml-2 text-yellow-900">{order.shippingCompany}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-700">Guía:</span>
                  <span className="text-yellow-900 font-mono">{order.trackingNumber}</span>
                  <button 
                    onClick={() => copyToClipboard(order.trackingNumber || '')}
                    className="p-1 hover:bg-yellow-100 rounded"
                  >
                    <Copy className="w-3 h-3 text-yellow-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Order Items */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Productos ({order.items?.length || 0})
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Producto</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-600">Cantidad</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Precio</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-lg text-[#0F2D5C]">
                    {formatCurrency(order.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Notas</h4>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
