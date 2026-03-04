import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SalesChartProps {
  data: { label: string; value: number; previousValue?: number }[];
  title?: string;
  showComparison?: boolean;
}

export function SalesChart({ data, title = "Ventas", showComparison = true }: SalesChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const maxPreviousValue = showComparison ? Math.max(...data.map(d => d.previousValue || 0)) : 0;
  const globalMax = Math.max(maxValue, maxPreviousValue);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const previousTotal = showComparison 
    ? data.reduce((sum, d) => sum + (d.previousValue || 0), 0) 
    : 0;
  const percentChange = previousTotal > 0 ? ((total - previousTotal) / previousTotal * 100) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          {showComparison && (
            <div className={`flex items-center gap-1 text-sm ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">{percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center gap-1">
                {showComparison && item.previousValue !== undefined && item.previousValue > 0 && (
                  <div 
                    className="w-full max-w-6 bg-gray-200 rounded-t-sm"
                    style={{ height: `${(item.previousValue / globalMax) * 200}px` }}
                  />
                )}
                <div 
                  className="w-full max-w-8 bg-gradient-to-t from-[#0F2D5C] to-[#1e5ab8] rounded-t-md shadow-sm"
                  style={{ height: `${(item.value / globalMax) * 200}px`, minHeight: item.value > 0 ? '8px' : '0' }}
                />
              </div>
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-400",
  paid: "bg-blue-500",
  sent: "bg-yellow-500",
  delivered: "bg-green-500",
  failed: "bg-red-500",
};

export function DonutChart({ data, title = "Estados" }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  let cumulativePercentage = 0;
  
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const dashArray = `${percentage} ${100 - percentage}`;
                const dashOffset = -cumulativePercentage;
                cumulativePercentage += percentage;
                
                return (
                  <circle
                    key={index}
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="3"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-500"
                  />
                );
              })}
              <circle cx="18" cy="18" r="12" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{total}</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Función helper para formatear datos de ventas por mes
export function processMonthlySales(orders: { createdAt: { _seconds: number }; amount: number; status: string }[], months = 6) {
  const now = new Date();
  const monthsData = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const monthOrders = orders.filter(o => {
      const d = new Date(o.createdAt._seconds * 1000);
      return d >= date && d < nextDate;
    });
    
    const value = monthOrders.reduce((sum, o) => sum + o.amount, 0);
    const previousDate = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
    const previousNextDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const previousMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt._seconds * 1000);
      return d >= previousDate && d < previousNextDate;
    });
    const previousValue = previousMonthOrders.reduce((sum, o) => sum + o.amount, 0);
    
    monthsData.push({
      label: date.toLocaleDateString("es-MX", { month: "short" }),
      value,
      previousValue: i < months - 1 ? previousValue : undefined
    });
  }
  
  return monthsData;
}

// Función helper para formatear datos de estados de pedidos
export function processOrderStatus(orders: { status: string }[]) {
  const statusCounts: Record<string, number> = {};
  orders.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });
  
  return [
    { label: "Pendientes", value: statusCounts.pending || 0, color: "#9CA3AF" },
    { label: "Pagados", value: statusCounts.paid || 0, color: "#3B82F6" },
    { label: "Enviados", value: statusCounts.sent || 0, color: "#EAB308" },
    { label: "Entregados", value: statusCounts.delivered || 0, color: "#22C55E" },
    { label: "Cancelados", value: statusCounts.failed || 0, color: "#EF4444" },
  ].filter(d => d.value > 0);
}

// Función helper para ventas por día de la semana
export function processWeeklySales(orders: { createdAt: { _seconds: number }; amount: number }[]) {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dayTotals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  
  orders.forEach(order => {
    const d = new Date(order.createdAt._seconds * 1000);
    const day = d.getDay();
    dayTotals[day] += order.amount;
  });
  
  return days.map((label, index) => ({
    label,
    value: dayTotals[index]
  }));
}
