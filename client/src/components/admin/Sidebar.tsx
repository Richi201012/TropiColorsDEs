import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  FileText,
  ChevronLeft,
  Menu
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", color: "blue" },
  { id: "pedidos", icon: Package, label: "Pedidos", color: "orange" },
  { id: "productos", icon: BarChart3, label: "Productos", color: "green" },
  { id: "clientes", icon: Users, label: "Clientes", color: "purple" },
  { id: "reportes", icon: FileText, label: "Reportes", color: "yellow" },
  { id: "facturas", icon: FileText, label: "Facturas", color: "red" },
  { id: "configuracion", icon: Settings, label: "Configuración", color: "gray" },
];

const colorMap: Record<string, { bg: string; icon: string; active: string }> = {
  blue: { bg: "bg-blue-500/10", icon: "text-blue-400", active: "bg-blue-500/20 text-blue-400" },
  orange: { bg: "bg-orange-500/10", icon: "text-orange-400", active: "bg-orange-500/20 text-orange-400" },
  green: { bg: "bg-green-500/10", icon: "text-green-400", active: "bg-green-500/20 text-green-400" },
  purple: { bg: "bg-purple-500/10", icon: "text-purple-400", active: "bg-purple-500/20 text-purple-400" },
  yellow: { bg: "bg-yellow-500/10", icon: "text-yellow-400", active: "bg-yellow-500/20 text-yellow-400" },
  red: { bg: "bg-red-500/10", icon: "text-red-400", active: "bg-red-500/20 text-red-400" },
  gray: { bg: "bg-gray-500/10", icon: "text-gray-400", active: "bg-gray-500/20 text-gray-400" },
};

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`${collapsed ? 'w-20' : 'w-64'} bg-[#0F2D5C] text-white flex flex-col transition-all duration-300 fixed h-screen z-50`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">Tropicolors</h1>
            <p className="text-xs text-blue-300">Administración</p>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const colors = colorMap[item.color];
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? `${colors.active} shadow-lg shadow-${item.color}-500/20` 
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
