import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Package, CheckCircle, Truck, CreditCard, AlertCircle, Home, ArrowLeft, ShoppingBag } from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string | null;
  receiptUrl: string | null;
  items: OrderItem[] | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  trackingNumber: string | null;
  shippingCompany: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: "pending", label: "Pedido recibido", icon: ShoppingBag, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { key: "paid", label: "Pago confirmado", icon: CreditCard, color: "text-blue-600", bgColor: "bg-blue-100" },
  { key: "sent", label: "Enviado", icon: Truck, color: "text-purple-600", bgColor: "bg-purple-100" },
  { key: "delivered", label: "Entregado", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
];

function getStatusIndex(status: string): number {
  const index = statusSteps.findIndex(s => s.key === status);
  return index >= 0 ? index : 0;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(amount: number, currency: string = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency,
  }).format(amount / 100);
}

export default function OrderTracking() {
  const [location, setLocation] = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get order number from URL path
  const orderNumber = location.split("/pedido/")[1]?.split("?")[0] || "";

  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) {
        setError("Número de pedido no proporcionado");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderNumber}`);
        const data = await response.json();

        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || "Pedido no encontrado");
        }
      } catch (err) {
        setError("Error al cargar el pedido");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información de tu pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => setLocation("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Tropicolors</h1>
          <p className="text-gray-600">Seguimiento de tu pedido</p>
        </div>

        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        {/* Order Number Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Número de pedido</p>
                <p className="text-2xl font-bold text-gray-900">{order.orderNumber}</p>
              </div>
              <Badge 
                variant={order.status === "delivered" ? "default" : "secondary"}
                className={`text-lg px-4 py-1 ${
                  order.status === "delivered" ? "bg-green-600" :
                  order.status === "sent" ? "bg-purple-600" :
                  order.status === "paid" ? "bg-blue-600" :
                  order.status === "failed" ? "bg-red-600" :
                  "bg-yellow-600"
                }`}
              >
                {order.status === "pending" && "Pendiente"}
                {order.status === "paid" && "Pagado"}
                {order.status === "sent" && "Enviado"}
                {order.status === "delivered" && "Entregado"}
                {order.status === "failed" && "Fallido"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Estado de tu pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div 
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-2
                        ${isCompleted ? step.bgColor : "bg-gray-100"}
                        ${isCurrent ? "ring-4 ring-blue-200" : ""}
                      `}
                    >
                      <Icon className={`h-6 w-6 ${isCompleted ? step.color : "text-gray-400"}`} />
                    </div>
                    <p className={`text-xs text-center ${isCompleted ? "font-medium text-gray-900" : "text-gray-500"}`}>
                      {step.label}
                    </p>
                    {index < statusSteps.length - 1 && (
                      <div 
                        className={`
                          absolute h-1 w-full top-6 -z-10
                          ${index < currentStatusIndex ? "bg-green-500" : "bg-gray-200"}
                        `}
                        style={{ transform: "translateX(50%)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tracking Info (if sent) */}
        {order.status === "sent" && order.trackingNumber && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Información de envío</p>
                  <p className="text-sm text-gray-600">{order.shippingCompany || "Paquetería"}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-sm text-gray-500">Número de rastreo</p>
                <p className="font-mono text-lg font-bold text-blue-700">{order.trackingNumber}</p>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Puedes rastrear tu paquete en el sitio de la paquetería
              </p>
            </CardContent>
          </Card>
        )}

        {/* Shipping Address */}
        {order.shippingAddress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5" />
                Dirección de envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.customerName}</p>
              <p className="text-gray-600">{order.shippingAddress}</p>
              <p className="text-gray-600">
                {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
              </p>
              <p className="text-gray-600">{order.shippingCountry}</p>
              {order.customerPhone && (
                <p className="text-gray-600 mt-2">Tel: {order.customerPhone}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900">Total</p>
                  <p className="text-lg font-bold text-blue-700">{formatPrice(order.amount)}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No hay información de productos disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Order Dates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Información del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <p className="text-gray-500">Fecha de compra</p>
              <p className="text-gray-900">{formatDate(order.createdAt)}</p>
            </div>
            {order.shippedAt && (
              <div className="flex justify-between">
                <p className="text-gray-500">Fecha de envío</p>
                <p className="text-gray-900">{formatDate(order.shippedAt)}</p>
              </div>
            )}
            {order.deliveredAt && (
              <div className="flex justify-between">
                <p className="text-gray-500">Fecha de entrega</p>
                <p className="text-gray-900">{formatDate(order.deliveredAt)}</p>
              </div>
            )}
            <div className="flex justify-between">
              <p className="text-gray-500">Método de pago</p>
              <p className="text-gray-900 capitalize">{order.paymentMethod}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-2">
              ¿Tienes alguna duda sobre tu pedido?
            </p>
            <p className="text-sm text-gray-500">
              Contáctanos por WhatsApp o email
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Tropicolors. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
