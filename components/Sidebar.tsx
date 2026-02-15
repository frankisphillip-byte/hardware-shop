
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Calculator, 
  Users, 
  Truck, 
  LogOut,
  Hammer,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  permissions: string[];
  onLogout: () => void;
  storeName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, permissions, onLogout, storeName }) => {
  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pos', path: '/pos', icon: ShoppingCart, label: 'Point of Sale' },
    { id: 'inventory', path: '/inventory', icon: Package, label: 'Inventory' },
    { id: 'accounting', path: '/accounting', icon: Calculator, label: 'Accounting' },
    { id: 'employees', path: '/employees', icon: Users, label: 'Employees' },
    { id: 'deliveries', path: '/deliveries', icon: Truck, label: 'Deliveries' },
    { id: 'settings', path: '/settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl z-20">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="p-2 bg-blue-600 rounded-lg shrink-0">
          <Hammer className="w-6 h-6" />
        </div>
        <span className="font-bold text-lg tracking-tight truncate">{storeName}</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          // Check if user has explicit permission or is admin for settings
          const hasAccess = permissions.includes(item.id) || (item.id === 'settings' && role === UserRole.ADMIN);
          
          return hasAccess && (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="px-4 py-2 bg-slate-800/50 rounded-lg flex items-center space-x-2 border border-slate-700/50">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Platform</span>
            <span className="text-[10px] font-bold text-slate-300">frankisdigital</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
