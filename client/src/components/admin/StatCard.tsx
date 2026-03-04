import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: "blue" | "green" | "orange" | "purple" | "red" | "yellow";
}

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", trendUp: "text-green-600", trendDown: "text-red-600" },
  green: { bg: "bg-green-50", icon: "text-green-600", trendUp: "text-green-600", trendDown: "text-red-600" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", trendUp: "text-green-600", trendDown: "text-red-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", trendUp: "text-green-600", trendDown: "text-red-600" },
  red: { bg: "bg-red-50", icon: "text-red-600", trendUp: "text-green-600", trendDown: "text-red-600" },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", trendUp: "text-green-600", trendDown: "text-red-600" },
};

export function StatCard({ title, value, icon: Icon, trend, subtitle, color = "blue" }: StatCardProps) {
  const colors = colorMap[color];
  
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? colors.trendUp : colors.trendDown}`}>
                <span className="font-medium">
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
                <span className="text-gray-400 ml-1">vs mes anterior</span>
              </div>
            )}
            {subtitle && !trend && (
              <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
            )}
          </div>
          <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center`}>
            <Icon className={`w-7 h-7 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatProps {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantMap = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export function QuickStat({ label, value, variant = "default" }: QuickStatProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${variantMap[variant]}`}>
        {value}
      </span>
    </div>
  );
}
