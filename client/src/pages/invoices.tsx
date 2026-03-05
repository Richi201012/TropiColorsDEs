/**
 * Invoices Page
 * 
 * Página de gestión de facturas con selección de pedidos
 * Estilo SaaS moderno
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Receipt, 
  Search, 
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Package,
  ChevronDown
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";

// ============================================
// Types
// ============================================

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
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerRfc?: string;
  notes?: string;
  receiptUrl?: string;
  items: OrderItem[];
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  createdAt: { _seconds: number; _nanoseconds?: number };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerRFC: string;
  customerEmail: string;
  customerAddress: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: "pendiente" | "enviada" | "pagada" | "fallida";
  notes: string | null;
  createdAt: string;
  sentAt: string | null;
}

interface InvoiceApiResponse {
  success: boolean;
  data?: Invoice[];
  error?: string;
}

// ============================================
// Helper Functions
// ============================================

function formatCurrency(cents: number): string {
  // Si el valor es mayor a 10000, asumimos que ya está en centavos
  // Los precios típicos en MXN para productos son menores a 10000 pesos
  const isCents = cents > 10000;
  const value = isCents ? cents / 100 : cents;
  
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateFromOrder(date: { _seconds: number } | null): string {
  if (!date) return "-";
  return new Date(date._seconds * 1000).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadge(status: Invoice["status"]) {
  const config = {
    pendiente: { variant: "secondary" as const, icon: Clock, label: "Pendiente" },
    enviada: { variant: "default" as const, icon: Send, label: "Enviada" },
    pagada: { variant: "secondary" as const, icon: CheckCircle2, label: "Pagada" },
    fallida: { variant: "destructive" as const, icon: AlertCircle, label: "Fallida" },
  };
  
  const { variant, icon: Icon, label } = config[status];
  
  return (
    <Badge variant={variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// ============================================
// Componente Principal
// ============================================

export default function InvoicesPage() {
  // Estado
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal crear factura
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    customerName: "",
    customerRFC: "",
    customerEmail: "",
    customerAddress: "",
    items: [] as { description: string; quantity: number; unitPrice: number }[],
    taxRate: 16,
    notes: "",
    sendEmail: true,
  });
  
  // Modal detalles
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Cargar pedidos
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, []);

  // Cargar facturas
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/invoices");
      const data: InvoiceApiResponse = await response.json();
      
      if (data.success && data.data) {
        setInvoices(data.data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setFeedback({
        type: "error",
        message: "Error al cargar las facturas",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, [fetchInvoices, fetchOrders]);

  // Limpiar feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Filtrar facturas
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerRFC.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Calcular totales
  const totals = {
    subtotal: formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    taxAmount: Math.round(formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * (formData.taxRate / 100)),
    total: 0,
  };
  totals.total = totals.subtotal + totals.taxAmount;

  // Seleccionar pedido
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      // Convertir amounts de centavos a pesos para mostrar
      const items = order.items.map(item => ({
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.price, // Ya viene en centavos
      }));
      
      setFormData({
        customerName: order.customerName,
        customerRFC: order.customerRfc || "",
        customerEmail: order.customerEmail,
        customerAddress: order.shippingAddress 
          ? `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode || ""}`
          : "",
        items,
        taxRate: 16,
        notes: "",
        sendEmail: true,
      });
    }
  };

  // Crear factura
  const handleCreateInvoice = async () => {
    if (!formData.customerName || !formData.customerRFC || formData.items.length === 0) {
      setFeedback({ type: "error", message: "Faltan datos requeridos" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Datos del emisor (TropicColors)
      const apiData = {
        issuerName: "TropicColors SA de CV",
        issuerRFC: "TCO980123ABC",
        issuerAddress: "Av. Principal 123, Col. Centro, Ciudad de México, CP 01000",
        issuerEmail: "facturas@tropicolors.com",
        issuerPhone: "55-1234-5678",
        customerName: formData.customerName,
        customerRFC: formData.customerRFC,
        customerEmail: formData.customerEmail,
        customerAddress: formData.customerAddress,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        taxRate: formData.taxRate,
        notes: formData.notes,
        sendEmail: formData.sendEmail,
      };

      const response = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFeedback({
          type: "success",
          message: `Factura ${result.data.invoiceNumber} creada correctamente`,
        });
        setIsCreateModalOpen(false);
        resetForm();
        fetchInvoices();
      } else {
        setFeedback({ type: "error", message: result.error || "Error al crear factura" });
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setFeedback({ type: "error", message: "Error de conexión" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset formulario
  const resetForm = () => {
    setSelectedOrderId("");
    setFormData({
      customerName: "",
      customerRFC: "",
      customerEmail: "",
      customerAddress: "",
      items: [],
      taxRate: 16,
      notes: "",
      sendEmail: true,
    });
  };

  // Enviar factura
  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoice.id }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFeedback({ type: "success", message: `Factura enviada a ${invoice.customerEmail}` });
        fetchInvoices();
      } else {
        setFeedback({ type: "error", message: result.error || "Error al enviar factura" });
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      setFeedback({ type: "error", message: "Error de conexión" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-7 w-7 text-teal-600" />
              Facturación
            </h1>
            <p className="text-slate-500 mt-1">Crea facturas desde pedidos</p>
          </div>
          
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                feedback.type === "success" 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtros */}
        <Card className="mb-6 border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar facturas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de facturas */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">Facturas ({filteredInvoices.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600">No hay facturas</h3>
                <p className="text-slate-500 mt-1">Crea tu primera factura desde un pedido</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Factura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-slate-50">
                      <TableCell>
                        <span className="font-mono font-medium text-teal-600">
                          {invoice.invoiceNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{invoice.customerName}</p>
                          <p className="text-sm text-slate-500">RFC: {invoice.customerRFC}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(invoice.createdAt)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.status === "pendiente" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendInvoice(invoice)}
                              title="Enviar por email"
                            >
                              <Send className="h-4 w-4 text-teal-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Crear Factura */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-teal-600" />
              Nueva Factura
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Selector de Pedido */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Seleccionar Pedido
              </Label>
              <Select value={selectedOrderId} onValueChange={handleSelectOrder}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un pedido..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      <div className="flex justify-between w-full">
                        <span>{order.orderNumber}</span>
                        <span className="text-slate-500 ml-2">{order.customerName}</span>
                        <span className="text-teal-600 ml-2">{formatCurrency(order.amount)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrderId && (
              <>
                {/* Datos del Cliente */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-700 border-b pb-2">Datos del Cliente</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre / Razón Social</Label>
                      <Input 
                        value={formData.customerName} 
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>RFC</Label>
                      <Input 
                        value={formData.customerRFC} 
                        onChange={(e) => setFormData({...formData, customerRFC: e.target.value.toUpperCase()})}
                        placeholder="XXXX000101XXX"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={formData.customerEmail} 
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Dirección</Label>
                      <Input 
                        value={formData.customerAddress} 
                        onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Conceptos */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-700 border-b pb-2">Conceptos</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-center">Cantidad</TableHead>
                          <TableHead className="text-right">P. Unitario</TableHead>
                          <TableHead className="text-right">Importe</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Totales y Opciones */}
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>IVA ({formData.taxRate}%):</span>
                        <span>{formatCurrency(totals.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-teal-600 pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sendEmail"
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({...formData, sendEmail: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="sendEmail" className="cursor-pointer">
                      Enviar factura por email al cliente
                    </Label>
                  </div>
                </div>
              </>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateInvoice} 
                disabled={isSubmitting || !selectedOrderId}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Generar Factura
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
