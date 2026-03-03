import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InvoicesPage from "./invoices";
import {
  LayoutDashboard, Package, Users, BarChart3, FileText, Settings, LogOut, Search, Plus, Download, 
  DollarSign, ShoppingCart, User, CheckCircle, X, Send, Mail, Lock, TrendingUp, TrendingDown,
  Clock, Truck, AlertCircle, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Receipt
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

// Types
interface OrderItem { id: number; name: string; price: number; quantity: number; }
interface Order {
  id: string; orderNumber: string; paymentIntentId: string; amount: number; currency: string;
  paymentMethod: string; customerName: string; customerEmail: string; customerPhone: string;
  notes: string | null; receiptUrl: string | null; items: OrderItem[]; shippingAddress: string;
  shippingCity: string; shippingState: string; shippingPostalCode: string; shippingCountry: string;
  createdAt: { _seconds: number; _nanoseconds?: number };
  trackingNumber: string | null; shippingCompany: string | null;
  shippedAt: { _seconds: number; _nanoseconds?: number } | null;
  deliveredAt: { _seconds: number; _nanoseconds?: number } | null;
  status: string; updatedAt: { _seconds: number; _nanoseconds?: number };
  customerRfc?: string;
}

// Auth
const ADMIN_EMAIL = "admin@tropicolors.mx";
const ADMIN_PASSWORD = "tropi2024";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("tropicolors_admin_auth");
    if (auth === "true") setIsAuthenticated(true);
    setLoadingAuth(false);
  }, []);

  const handleLogin = (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("tropicolors_admin_auth", "true");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("tropicolors_admin_auth");
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F2D5C] to-[#1a4a7a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;
  return <AdminDashboard onLogout={handleLogout} />;
}

function LoginPage({ onLogin }: { onLogin: (email: string, password: string) => boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (onLogin(email, password)) {} 
      else { setError("Email o contraseña incorrectos"); setLoading(false); }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2D5C] to-[#1a4a7a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 bg-[#0F2D5C] rounded-full flex items-center justify-center">
            <span className="text-white text-3xl font-bold">T</span>
          </div>
          <CardTitle className="text-2xl text-[#0F2D5C]">Tropicolors</CardTitle>
          <p className="text-gray-500 text-sm">Panel de Administración</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input id="email" type="email" placeholder="admin@tropicolors.mx" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full bg-[#0F2D5C] hover:bg-[#0a1f40]" disabled={loading}>
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <LogOut className="w-4 h-4 mr-2" />}
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Toggle row expansion
  const toggleRow = (orderId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();
        if (data.success) setOrders(data.orders);
      } catch (error) { console.error("Error fetching orders:", error); }
      finally { setLoading(false); }
    }
    fetchOrders();
  }, []);

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "pedidos", icon: Package, label: "Pedidos" },
    { id: "productos", icon: ShoppingCart, label: "Productos" },
    { id: "clientes", icon: Users, label: "Clientes" },
    { id: "reportes", icon: BarChart3, label: "Reportes" },
    { id: "configuracion", icon: Settings, label: "Configuración" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2D5C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F2D5C] text-white flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold">Tropicolors</h1>
          <p className="text-xs text-blue-200">Administración</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id ? "bg-white/20 text-white" : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === "dashboard" && <DashboardPage orders={orders} onNavigate={setActiveTab} />}
        {activeTab === "pedidos" && <OrdersPage orders={orders} setOrders={setOrders} />}
        {activeTab === "productos" && <ProductsPage orders={orders} />}
        {activeTab === "clientes" && <ClientesPage orders={orders} />}
        {activeTab === "reportes" && <ReportesPage orders={orders} />}
        {activeTab === "facturas" && <InvoicesPage />}
        {activeTab === "configuracion" && <ConfiguracionPage />}
      </main>
    </div>
  );
}

// Dashboard Page
function DashboardPage({ orders, onNavigate }: { orders: Order[]; onNavigate: (tab: string) => void }) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthOrders = orders.filter(o => new Date(o.createdAt._seconds * 1000) >= startOfMonth);
  const lastMonthOrders = orders.filter(o => {
    const d = new Date(o.createdAt._seconds * 1000);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  });

  const thisMonthSales = thisMonthOrders.reduce((sum, o) => sum + o.amount, 0);
  const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + o.amount, 0);
  const salesGrowth = lastMonthSales > 0 ? ((thisMonthSales - lastMonthSales) / lastMonthSales * 100) : 0;

  const stats = [
    { label: "Ventas Totales", value: formatCurrency(orders.reduce((s, o) => s + o.amount, 0)), icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: "Ventas del Mes", value: formatCurrency(thisMonthSales), icon: TrendingUp, color: "text-[#0F2D5C]", bg: "bg-blue-100", subtext: `${salesGrowth >= 0 ? '+' : ''}${salesGrowth.toFixed(1)}% vs mes anterior` },
    { label: "Pedidos del Mes", value: thisMonthOrders.length.toString(), icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Clientes Nuevos", value: new Set(orders.map(o => o.customerEmail)).size.toString(), icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const recentOrders = [...orders].sort((a, b) => b.createdAt._seconds - a.createdAt._seconds).slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Resumen de tu negocio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.subtext && <p className="text-xs text-green-600 mt-1">{stat.subtext}</p>}
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pedidos Recientes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("pedidos")}>Ver todos</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.amount)}</p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Acciones Rápidas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-[#0F2D5C] hover:bg-[#0a1f40]" onClick={() => onNavigate("facturas")}>
              <FileText className="w-4 h-4 mr-2" />Nueva Factura
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => window.open("/admin/facturas", "_blank")}>
              <Receipt className="w-4 h-4 mr-2" />Gestionar Facturas
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate("reportes")}>
              <BarChart3 className="w-4 h-4 mr-2" />Ver Reportes
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate("pedidos")}>
              <Package className="w-4 h-4 mr-2" />Gestionar Pedidos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Orders Page
function OrdersPage({ orders, setOrders }: { orders: Order[]; setOrders: (orders: Order[]) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Toggle row expansion
  const toggleRow = (orderId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (order: Order, newStatus: string) => {
    setSelectedOrder(order);
    setNewStatus(newStatus);
    if (newStatus === "sent") {
      setShippingModalOpen(true);
    } else {
      setStatusModalOpen(true);
    }
  };

  const confirmStatusChange = async () => {
    if (!selectedOrder) return;
    try {
      const response = await fetch("/api/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
          trackingNumber: newStatus === "sent" ? trackingNumber : undefined,
          shippingCompany: newStatus === "sent" ? shippingCompany : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const updatedOrders = orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus, trackingNumber: trackingNumber || null, shippingCompany: shippingCompany || null } : o);
        setOrders(updatedOrders);
        toast({ title: "Estado actualizado", description: `El pedido ahora está ${getStatusText(newStatus)}` });
      } else {
        toast({ title: "Error", description: data.message || "No se pudo actualizar", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
    }
    setStatusModalOpen(false);
    setShippingModalOpen(false);
    setTrackingNumber("");
    setShippingCompany("");
    setSelectedOrder(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500">Gestiona los pedidos de tus clientes</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="failed">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Conceptos</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No hay pedidos</TableCell></TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <>
                    <TableRow 
                      key={order.id} 
                      className={`cursor-pointer hover:bg-gray-50 ${expandedRows.has(order.id) ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleRow(order.id)}
                    >
                      <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div><div className="font-medium">{order.customerName}</div><div className="text-sm text-gray-500">{order.customerEmail}</div></div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{getItemsSummary(order.items)}</span>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedRows.has(order.id) ? 'rotate-90' : ''}`} />
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(order.amount)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select value={order.status} onValueChange={(status) => handleStatusChange(order, status)}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                            <SelectItem value="sent">Enviado</SelectItem>
                            <SelectItem value="delivered">Entregado</SelectItem>
                            <SelectItem value="failed">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(order.id) && order.items && order.items.length > 0 && (
                      <TableRow key={`${order.id}-expanded`} className="bg-gray-50/50">
                        <TableCell colSpan={7} className="py-0">
                          <div className="py-3 px-4">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Detalle del pedido</div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50">
                                    <TableHead className="text-left">Producto</TableHead>
                                    <TableHead className="text-center">Cantidad</TableHead>
                                    <TableHead className="text-right">P. Unitario</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.items.map((item, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="font-medium">{item.name}</TableCell>
                                      <TableCell className="text-center">{item.quantity}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                      <TableCell className="text-right font-semibold">{formatCurrency(item.price * item.quantity)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Status Confirmation Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cambio de Estado</DialogTitle>
            <DialogDescription>¿Estás seguro de cambiar el estado a "{getStatusText(newStatus)}"?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>Cancelar</Button>
            <Button className="bg-[#0F2D5C]" onClick={confirmStatusChange}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shipping Modal */}
      <Dialog open={shippingModalOpen} onOpenChange={setShippingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Información de Envío</DialogTitle>
            <DialogDescription>Ingresa los datos de paquetería para el envío</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nombre de Paquetería</Label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger><SelectValue placeholder="Selecciona paquetería" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FedEx">FedEx</SelectItem>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="Estafeta">Estafeta</SelectItem>
                  <SelectItem value="Paquetexpress">Paquetexpress</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número de Guía</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Número de guía" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShippingModalOpen(false)}>Cancelar</Button>
            <Button className="bg-[#0F2D5C]" onClick={confirmStatusChange} disabled={!trackingNumber || !shippingCompany}>Confirmar Envío</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Products Page
function ProductsPage({ orders }: { orders: Order[] }) {
  const productCounts: Record<string, number> = {};
  orders.forEach(order => order.items.forEach(item => { productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity; }));
  const topProducts = Object.entries(productCounts).sort(([, a], [, b]) => b - a).slice(0, 20);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <p className="text-gray-500">Productos más vendidos</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Top Productos Vendidos</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Cantidad Vendida</TableHead></TableRow></TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center">No hay datos</TableCell></TableRow>
              ) : (
                topProducts.map(([product, count]) => (
                  <TableRow key={product}><TableCell className="font-medium">{product}</TableCell><TableCell className="font-bold text-green-600">{count}</TableCell></TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Clientes Page
function ClientesPage({ orders }: { orders: Order[] }) {
  const customerData: Record<string, { name: string; email: string; orders: number; total: number }> = {};
  orders.forEach(order => {
    if (!customerData[order.customerEmail]) customerData[order.customerEmail] = { name: order.customerName, email: order.customerEmail, orders: 0, total: 0 };
    customerData[order.customerEmail].orders++;
    customerData[order.customerEmail].total += order.amount;
  });
  const topClientes = Object.entries(customerData).sort(([, a], [, b]) => b.total - a.total).slice(0, 20);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500">Análisis de clientes</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Top Clientes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Email</TableHead><TableHead>Pedidos</TableHead><TableHead>Total Gastado</TableHead></TableRow></TableHeader>
            <TableBody>
              {topClientes.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">No hay datos</TableCell></TableRow>
              ) : (
                topClientes.map(([email, data]) => (
                  <TableRow key={email}><TableCell className="font-medium">{data.name}</TableCell><TableCell className="text-gray-500">{email}</TableCell><TableCell>{data.orders}</TableCell><TableCell className="font-bold">{formatCurrency(data.total)}</TableCell></TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Reportes Page
function ReportesPage({ orders }: { orders: Order[] }) {
  const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("month");

  const getFilteredOrders = () => {
    if (!orders.length) return [];
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return orders.filter(order => {
      const d = new Date(order.createdAt._seconds * 1000);
      if (dateRange === "week") return d >= startOfWeek;
      if (dateRange === "month") return d >= startOfMonth;
      if (dateRange === "year") return d >= startOfYear;
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();
  const totalSales = filteredOrders.reduce((s, o) => s + o.amount, 0);
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(o => o.status === "delivered").length;

  const downloadCSV = () => {
    let csv = "Fecha,Pedido,Cliente,Monto,Estado\n";
    filteredOrders.forEach(o => { csv += `"${formatDate(o.createdAt)}","${o.orderNumber}","${o.customerName}",${o.amount / 100},"${o.status}"\n`; });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-${dateRange}-${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-900">Reportes</h1><p className="text-gray-500">Análisis del negocio</p></div>
        <Button onClick={downloadCSV} className="bg-[#0F2D5C]"><Download className="w-4 h-4 mr-2" />Descargar CSV</Button>
      </div>

      <div className="mb-6 flex gap-2">
        {(["week", "month", "year", "all"] as const).map(r => (
          <Button key={r} variant={dateRange === r ? "default" : "outline"} size="sm" onClick={() => setDateRange(r)} className={dateRange === r ? "bg-[#0F2D5C]" : ""}>
            {r === "week" ? "Semana" : r === "month" ? "Mes" : r === "year" ? "Año" : "Todo"}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card><CardContent className="p-6"><div className="text-sm text-gray-500">Ventas Totales</div><div className="text-3xl font-bold text-[#0F2D5C]">{formatCurrency(totalSales)}</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-sm text-gray-500">Pedidos</div><div className="text-3xl font-bold text-[#0F2D5C]">{totalOrders}</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-sm text-gray-500">Completados</div><div className="text-3xl font-bold text-green-600">{completedOrders}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Detalle de Ventas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Monto</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredOrders.map(o => (
                <TableRow key={o.id}><TableCell>{formatDate(o.createdAt)}</TableCell><TableCell className="font-mono">{o.orderNumber}</TableCell><TableCell>{o.customerName}</TableCell><TableCell className="font-semibold">{formatCurrency(o.amount)}</TableCell><TableCell>{getStatusBadge(o.status)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Configuración Page
function ConfiguracionPage() {
  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Configuración</h1><p className="text-gray-500">Ajustes del sistema</p></div>
      <Card>
        <CardHeader><CardTitle>Información de la Empresa</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nombre de la Empresa</Label><Input defaultValue="Tropicolors" /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="admin@tropicolors.mx" /></div>
          </div>
          <Button className="bg-[#0F2D5C]">Guardar Cambios</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Helpers
function formatCurrency(cents: number) { return "$" + (cents / 100).toFixed(2); }
function formatDate(ts: { _seconds: number }) { return new Date(ts._seconds * 1000).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }); }

// Resumen de conceptos para la tabla
function getItemsSummary(items: OrderItem[]): string {
  if (!items || items.length === 0) return "Sin productos";
  if (items.length === 1) {
    // Truncar nombre largo
    const name = items[0].name;
    return name.length > 25 ? name.substring(0, 22) + "..." : name;
  }
  return `${items.length} productos`;
}

// Formato detallado para la fila expandida
function formatItemDetail(item: OrderItem): string {
  return `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`;
}
function getStatusBadge(status: string) {
  const s: Record<string, JSX.Element> = {
    pending: <Badge className="bg-gray-100 text-gray-800">Pendiente</Badge>,
    paid: <Badge className="bg-blue-100 text-blue-800">Pagado</Badge>,
    sent: <Badge className="bg-yellow-100 text-yellow-800">Enviado</Badge>,
    delivered: <Badge className="bg-green-100 text-green-800">Entregado</Badge>,
    failed: <Badge className="bg-red-100 text-red-800">Cancelado</Badge>,
  };
  return s[status] || <Badge>{status}</Badge>;
}
function getStatusText(status: string) { const t: Record<string, string> = { pending: "Pendiente", paid: "Pagado", sent: "Enviado", delivered: "Entregado", failed: "Cancelado" }; return t[status] || status; }
