import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoicesPage from "./invoices";
import {
  LayoutDashboard, Package, Users, BarChart3, FileText, Settings, LogOut, Search, Plus, Download,
  DollarSign, ShoppingCart, User, CheckCircle, X, Send, Mail, Lock, TrendingUp, TrendingDown,
  Clock, Truck, AlertCircle, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Receipt, PackageCheck,
  ArrowUpDown, Filter, Calendar, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/admin/StatCard";
import { SalesChart, DonutChart, processMonthlySales, processOrderStatus, processWeeklySales } from "@/components/admin/SalesChart";
import { Sidebar } from "@/components/admin/Sidebar";
import { OrderModal } from "@/components/admin/OrderModal";

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

// Helpers
function formatCurrency(cents: number) { return "$" + (cents / 100).toFixed(2); }
function formatDate(ts: { _seconds: number }) { return new Date(ts._seconds * 1000).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }); }
function getItemsSummary(items: OrderItem[]): string {
  if (!items || items.length === 0) return "Sin productos";
  if (items.length === 1) {
    const name = items[0].name;
    return name.length > 25 ? name.substring(0, 22) + "..." : name;
  }
  return `${items.length} productos`;
}
function getStatusBadge(status: string) {
  const s: Record<string, JSX.Element> = {
    pending: <Badge className="bg-gray-100 text-gray-700 border-0">Pendiente</Badge>,
    paid: <Badge className="bg-blue-100 text-blue-700 border-0">Pagado</Badge>,
    sent: <Badge className="bg-yellow-100 text-yellow-700 border-0">Enviado</Badge>,
    delivered: <Badge className="bg-green-100 text-green-700 border-0">Entregado</Badge>,
    failed: <Badge className="bg-red-100 text-red-700 border-0">Cancelado</Badge>,
  };
  return s[status] || <Badge>{status}</Badge>;
}
function getStatusText(status: string) { const t: Record<string, string> = { pending: "Pendiente", paid: "Pagado", sent: "Enviado", delivered: "Entregado", failed: "Cancelado" }; return t[status] || status; }

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
      <Card className="w-full max-w-md shadow-2xl">
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

  // Fetch orders
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

  const toggleRow = (orderId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2D5C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />
      <main className="flex-1 ml-64 p-8 overflow-auto">
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

// ============================================
// DASHBOARD - Centro de Análisis del Negocio
// ============================================
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

  const totalSales = orders.reduce((s, o) => s + o.amount, 0);
  const thisMonthSales = thisMonthOrders.reduce((s, o) => s + o.amount, 0);
  const lastMonthSales = lastMonthOrders.reduce((s, o) => s + o.amount, 0);
  const salesGrowth = lastMonthSales > 0 ? ((thisMonthSales - lastMonthSales) / lastMonthSales * 100) : 0;

  const ticketPromedio = orders.length > 0 ? totalSales / orders.length : 0;
  const uniqueCustomers = new Set(orders.map(o => o.customerEmail)).size;
  const newCustomersThisMonth = new Set(thisMonthOrders.map(o => o.customerEmail)).size;

  const monthlyData = useMemo(() => processMonthlySales(orders, 6), [orders]);
  const statusData = useMemo(() => processOrderStatus(orders), [orders]);
  const weeklyData = useMemo(() => processWeeklySales(orders), [orders]);

  // Top products
  const productCounts: Record<string, number> = {};
  orders.forEach(order => order.items.forEach(item => { productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity; }));
  const topProducts = Object.entries(productCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

  // Recent activity
  const recentOrders = [...orders].sort((a, b) => b.createdAt._seconds - a.createdAt._seconds).slice(0, 8);

  // Order funnel
  const orderFunnel = [
    { label: "Creados", value: orders.length, color: "bg-blue-500" },
    { label: "Pagados", value: orders.filter(o => o.status !== "pending" && o.status !== "failed").length, color: "bg-green-500" },
    { label: "Entregados", value: orders.filter(o => o.status === "delivered").length, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen de tu negocio en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Totales"
          value={formatCurrency(totalSales)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Ventas del Mes"
          value={formatCurrency(thisMonthSales)}
          icon={TrendingUp}
          trend={{ value: salesGrowth, isPositive: salesGrowth >= 0 }}
          color="blue"
        />
        <StatCard
          title="Pedidos del Mes"
          value={thisMonthOrders.length.toString()}
          icon={Package}
          subtitle={`${orders.length} pedidos totales`}
          color="orange"
        />
        <StatCard
          title="Ticket Promedio"
          value={formatCurrency(ticketPromedio)}
          icon={ShoppingCart}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={monthlyData} title="Ventas por Mes" />
        </div>
        <div>
          <DonutChart data={statusData} title="Estados de Pedidos" />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay datos</p>
              ) : (
                topProducts.map(([product, count], index) => (
                  <div key={product} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                        index === 1 ? "bg-gray-100 text-gray-700" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[150px]">{product}</span>
                    </div>
                    <span className="font-bold text-[#0F2D5C]">{count} unidades</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Day */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Ventas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-1">
              {weeklyData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#0F2D5C] rounded-t" style={{ height: `${Math.max((item.value / Math.max(...weeklyData.map(d => d.value || 1))) * 160, item.value ? 4 : 0)}px` }} />
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Funnel */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Embudo de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderFunnel.map((step, index) => {
                const percentage = orders.length > 0 ? (step.value / orders.length) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{step.label}</span>
                      <span className="font-semibold">{step.value}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${step.color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {orders.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {orders.filter(o => o.status === "pending").length} pedidos pendientes de pago
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("pedidos")}>Ver todos</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-gray-600 truncate">{order.customerName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                  <span className="font-bold text-[#0F2D5C]">{formatCurrency(order.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// PEDIDOS - Gestión Mejorada
// ============================================
function OrdersPage({ orders, setOrders }: { orders: Order[]; setOrders: (orders: Order[]) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleRow = (orderId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    paid: orders.filter(o => o.status === "paid").length,
    sent: orders.filter(o => o.status === "sent").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    failed: orders.filter(o => o.status === "failed").length,
  };

  const handleStatusChange = (order: Order, newStatus: string) => {
    setSelectedOrder(order);
    setNewStatus(newStatus);
    if (newStatus === "sent") setShippingModalOpen(true);
    else setStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedOrder) return;
    try {
      const response = await fetch("/api/update-order-status", {
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
        const updatedOrders = orders.map(o => 
          o.id === selectedOrder.id 
            ? { ...o, status: newStatus, trackingNumber: trackingNumber || null, shippingCompany: shippingCompany || null } 
            : o
        );
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 mt-1">Gestiona los pedidos de tus clientes</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <button onClick={() => setStatusFilter("all")} className={`p-4 rounded-xl text-center transition-all ${statusFilter === "all" ? "bg-[#0F2D5C] text-white" : "bg-white shadow-sm hover:shadow-md"}`}>
          <div className="text-2xl font-bold">{orderStats.total}</div>
          <div className={`text-sm ${statusFilter === "all" ? "text-blue-200" : "text-gray-500"}`}>Total</div>
        </button>
        <button onClick={() => setStatusFilter("pending")} className={`p-4 rounded-xl text-center transition-all ${statusFilter === "pending" ? "bg-gray-800 text-white" : "bg-white shadow-sm hover:shadow-md"}`}>
          <div className="text-2xl font-bold">{orderStats.pending}</div>
          <div className={`text-sm ${statusFilter === "pending" ? "text-gray-200" : "text-gray-500"}`}>Pendientes</div>
        </button>
        <button onClick={() => setStatusFilter("paid")} className={`p-4 rounded-xl text-center transition-all ${statusFilter === "paid" ? "bg-blue-600 text-white" : "bg-white shadow-sm hover:shadow-md"}`}>
          <div className="text-2xl font-bold">{orderStats.paid}</div>
          <div className={`text-sm ${statusFilter === "paid" ? "text-blue-200" : "text-gray-500"}`}>Pagados</div>
        </button>
        <button onClick={() => setStatusFilter("sent")} className={`p-4 rounded-xl text-center transition-all ${statusFilter === "sent" ? "bg-yellow-600 text-white" : "bg-white shadow-sm hover:shadow-md"}`}>
          <div className="text-2xl font-bold">{orderStats.sent}</div>
          <div className={`text-sm ${statusFilter === "sent" ? "text-yellow-200" : "text-gray-500"}`}>Enviados</div>
        </button>
        <button onClick={() => setStatusFilter("delivered")} className={`p-4 rounded-xl text-center transition-all ${statusFilter === "delivered" ? "bg-green-600 text-white" : "bg-white shadow-sm hover:shadow-md"}`}>
          <div className="text-2xl font-bold">{orderStats.delivered}</div>
          <div className={`text-sm ${statusFilter === "delivered" ? "text-green-200" : "text-gray-500"}`}>Entregados</div>
        </button>
        <button onClick={() => setStatusFilter("failed")} className={`p-4 rounded-xl text-center transition-all ${statusFilter === "failed" ? "bg-red-600 text-white" : "bg-white shadow-sm hover:shadow-md"}`}>
          <div className="text-2xl font-bold">{orderStats.failed}</div>
          <div className={`text-sm ${statusFilter === "failed" ? "text-red-200" : "text-gray-500"}`}>Cancelados</div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar por cliente, email o número de pedido..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filtrar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="failed">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Mostrando {filteredOrders.length} de {orders.length} pedidos
      </div>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Pedido</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">Conceptos</TableHead>
                <TableHead className="font-semibold">Fecha</TableHead>
                <TableHead className="font-semibold">Monto</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay pedidos que coincidan con los filtros</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <>
                    <TableRow 
                      key={order.id} 
                      className={`cursor-pointer hover:bg-gray-50 ${expandedRows.has(order.id) ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleRow(order.id)}
                    >
                      <TableCell className="font-mono font-semibold">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{getItemsSummary(order.items)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="font-bold text-[#0F2D5C]">{formatCurrency(order.amount)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Select value={order.status} onValueChange={(status) => handleStatusChange(order, status)}>
                            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="paid">Pagado</SelectItem>
                              <SelectItem value="sent">Enviado</SelectItem>
                              <SelectItem value="delivered">Entregado</SelectItem>
                              <SelectItem value="failed">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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

      {/* Order Detail Modal */}
      <OrderModal order={selectedOrder} open={modalOpen} onOpenChange={setModalOpen} />

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

// ============================================
// PRODUCTOS - Análisis de Ventas
// ============================================
function ProductsPage({ orders }: { orders: Order[] }) {
  // Calculate product stats
  const productData: Record<string, { name: string; quantity: number; revenue: number }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productData[item.name]) {
        productData[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productData[item.name].quantity += item.quantity;
      productData[item.name].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productData).sort((a, b) => b.quantity - a.quantity);
  const totalProductsSold = topProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Análisis de ventas por producto</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Productos Únicos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{topProducts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unidades Vendidas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalProductsSold}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ingresos por Productos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Todos los Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">#</TableHead>
                <TableHead className="font-semibold">Producto</TableHead>
                <TableHead className="font-semibold text-right">Cantidad Vendida</TableHead>
                <TableHead className="font-semibold text-right">Ingresos</TableHead>
                <TableHead className="font-semibold text-right">% del Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No hay datos</TableCell>
                </TableRow>
              ) : (
                topProducts.map((product, index) => {
                  const percentage = totalProductsSold > 0 ? (product.quantity / totalProductsSold) * 100 : 0;
                  return (
                    <TableRow key={product.name} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-500">{index + 1}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {product.quantity} unidades
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(product.revenue)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0F2D5C]" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-sm text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// CLIENTES - Análisis y Segmentación
// ============================================
function ClientesPage({ orders }: { orders: Order[] }) {
  const customerData: Record<string, { name: string; email: string; orders: number; total: number; lastOrder: number }> = {};
  orders.forEach(order => {
    if (!customerData[order.customerEmail]) {
      customerData[order.customerEmail] = { 
        name: order.customerName, 
        email: order.customerEmail, 
        orders: 0, 
        total: 0,
        lastOrder: order.createdAt._seconds 
      };
    }
    customerData[order.customerEmail].orders++;
    customerData[order.customerEmail].total += order.amount;
    customerData[order.customerEmail].lastOrder = Math.max(customerData[order.customerEmail].lastOrder, order.createdAt._seconds);
  });

  const customers = Object.values(customerData);
  
  // Segmentación
  const frequentCustomers = customers.filter(c => c.orders >= 3).sort((a, b) => b.total - a.total);
  const newCustomers = customers.filter(c => c.orders === 1).sort((a, b) => b.total - a.total);
  const inactiveCustomers = customers.filter(c => {
    const daysSinceLastOrder = (Date.now() / 1000 - c.lastOrder) / (60 * 60 * 24);
    return daysSinceLastOrder > 30 && c.orders < 3;
  });

  const topClientes = customers.sort((a, b) => b.total - a.total).slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Análisis y segmentación de clientes</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{customers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes Frecuentes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{frequentCustomers.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes Nuevos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{newCustomers.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes Inactivos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{inactiveCustomers.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for segments */}
      <Tabs defaultValue="top" className="space-y-4">
        <TabsList>
          <TabsTrigger value="top">Top Clientes</TabsTrigger>
          <TabsTrigger value="frecuentes">Frecuentes ({frequentCustomers.length})</TabsTrigger>
          <TabsTrigger value="nuevos">Nuevos ({newCustomers.length})</TabsTrigger>
          <TabsTrigger value="inactivos">Inactivos ({inactiveCustomers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="top">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold text-center">Pedidos</TableHead>
                    <TableHead className="font-semibold text-right">Total Gastado</TableHead>
                    <TableHead className="font-semibold text-right">Última Compra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClientes.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">No hay datos</TableCell></TableRow>
                  ) : (
                    topClientes.map((customer, index) => (
                      <TableRow key={customer.email} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? "bg-yellow-100 text-yellow-700" :
                              index === 1 ? "bg-gray-100 text-gray-700" :
                              index === 2 ? "bg-orange-100 text-orange-700" :
                              "bg-gray-50 text-gray-500"
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium">{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{customer.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{customer.orders} pedidos</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#0F2D5C]">{formatCurrency(customer.total)}</TableCell>
                        <TableCell className="text-right text-gray-500">
                          {formatDate({ _seconds: customer.lastOrder })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frecuentes">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-right">Total Gastado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {frequentCustomers.map((customer) => (
                    <TableRow key={customer.email}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-gray-600">{customer.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-100 text-green-700">{customer.orders} pedidos</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(customer.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nuevos">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Total Gastado</TableHead>
                    <TableHead className="text-right">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newCustomers.map((customer) => (
                    <TableRow key={customer.email}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-gray-600">{customer.email}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(customer.total)}</TableCell>
                      <TableCell className="text-right text-gray-500">{formatDate({ _seconds: customer.lastOrder })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactivos">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-right">Última Compra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveCustomers.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No hay clientes inactivos</TableCell></TableRow>
                  ) : (
                    inactiveCustomers.map((customer) => (
                      <TableRow key={customer.email}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-gray-600">{customer.email}</TableCell>
                        <TableCell className="text-center">{customer.orders}</TableCell>
                        <TableCell className="text-right text-gray-500">{formatDate({ _seconds: customer.lastOrder })}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// REPORTES - Panel Analítico
// ============================================
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
  const pendingOrders = filteredOrders.filter(o => o.status === "pending").length;

  const monthlyData = useMemo(() => processMonthlySales(filteredOrders, 12), [filteredOrders]);
  const statusData = useMemo(() => processOrderStatus(filteredOrders), [filteredOrders]);

  const downloadCSV = () => {
    let csv = "Fecha,Pedido,Cliente,Monto,Estado\n";
    filteredOrders.forEach(o => { csv += `"${formatDate(o.createdAt)}","${o.orderNumber}","${o.customerName}",${(o.amount/100).toFixed(2)},"${o.status}"\n`; });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-${dateRange}-${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-1">Análisis detallado del negocio</p>
        </div>
        <Button onClick={downloadCSV} className="bg-[#0F2D5C]">
          <Download className="w-4 h-4 mr-2" />
          Descargar CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-2">
        {(["week", "month", "year", "all"] as const).map(r => (
          <Button 
            key={r} 
            variant={dateRange === r ? "default" : "outline"} 
            size="sm" 
            onClick={() => setDateRange(r)}
            className={dateRange === r ? "bg-[#0F2D5C]" : ""}
          >
            {r === "week" ? "Semana" : r === "month" ? "Mes" : r === "year" ? "Año" : "Todo"}
          </Button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Ventas Totales</p>
            <p className="text-3xl font-bold text-[#0F2D5C] mt-1">{formatCurrency(totalSales)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Pedidos</p>
            <p className="text-3xl font-bold text-[#0F2D5C] mt-1">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Completados</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{completedOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingOrders}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={monthlyData} title="Ventas por Mes" />
        <DonutChart data={statusData} title="Estados de Pedidos" />
      </div>

      {/* Detailed Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Detalle de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Fecha</TableHead>
                <TableHead className="font-semibold">Pedido</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold text-right">Monto</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No hay datos</TableCell></TableRow>
              ) : (
                filteredOrders.slice(0, 50).map(o => (
                  <TableRow key={o.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-600">{formatDate(o.createdAt)}</TableCell>
                    <TableCell className="font-mono">{o.orderNumber}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(o.amount)}</TableCell>
                    <TableCell>{getStatusBadge(o.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredOrders.length > 50 && (
            <p className="text-center text-sm text-gray-500 py-4">
              Mostrando 50 de {filteredOrders.length} pedidos
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// CONFIGURACIÓN - Panel con Pestañas
// ============================================
function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [companyName, setCompanyName] = useState("Tropicolors");
  const [companyEmail, setCompanyEmail] = useState("admin@tropicolors.mx");
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Cambios guardados", description: "La configuración ha sido actualizada" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Administra la configuración de tu tienda</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Información de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la Empresa</Label>
                  <Input 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email de Contacto</Label>
                  <Input 
                    type="email"
                    value={companyEmail} 
                    onChange={(e) => setCompanyEmail(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo de la Empresa</Label>
                <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg">
                  <div className="w-16 h-16 bg-[#0F2D5C] rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">T</span>
                  </div>
                  <Button variant="outline" size="sm">Cambiar Logo</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select defaultValue="mxn">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mxn">Peso Mexicano (MXN)</SelectItem>
                      <SelectItem value="usd">Dólar Americano (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Fecha</Label>
                  <Select defaultValue="dd/mm/yyyy">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="bg-[#0F2D5C]" onClick={handleSave}>Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad Tab */}
        <TabsContent value="seguridad" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Cambiar Contraseña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contraseña Actual</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Nueva Contraseña</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Confirmar Nueva Contraseña</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button className="bg-[#0F2D5C]">Actualizar Contraseña</Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Sesiones Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sesión Actual</p>
                    <p className="text-sm text-gray-500">Esta sesión</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Activa</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones Tab */}
        <TabsContent value="notificaciones" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Notificaciones de Pedidos</p>
                  <p className="text-sm text-gray-500">Recibe notificaciones cuando haya nuevos pedidos</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Correos Automáticos</p>
                  <p className="text-sm text-gray-500">Enviar confirmaciones automáticas a clientes</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Recordatorios de Pago</p>
                  <p className="text-sm text-gray-500">Enviar recordatorios a clientes con pedidos pendientes</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <Button className="bg-[#0F2D5C]">Guardar Preferencias</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
