
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
  ShieldCheck,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  permissions: string[];
  onLogout: () => void;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, permissions, onLogout, storeName, isOpen, onClose }) => {
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
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 w-72 bg-slate-900/95 backdrop-blur-md text-white flex flex-col h-full shadow-2xl z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 shrink-0">
              <Hammer className="w-6 h-6" />
            </div>
            <span className="font-black text-lg tracking-tight truncate">{storeName}</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-800 rounded-xl">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Operations Menu</p>
          {menuItems.map((item) => {
            const hasAccess = permissions.includes(item.id) || (item.id === 'settings' && role === UserRole.ADMIN);
            
            return hasAccess && (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) => 
                  `flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`
                }
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="px-4 py-3 bg-slate-800/40 rounded-2xl flex items-center space-x-3 border border-slate-700/50">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Platform</span>
              <span className="text-[10px] font-black text-slate-300 tracking-tight">frankisdigital</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-4 px-4 py-3.5 w-full text-slate-400 hover:text-white hover:bg-rose-500/10 hover:text-rose-400 rounded-2xl transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-bold text-sm tracking-tight">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
