
import React, { useState, useMemo, useEffect } from 'react';
import { User, Product, Delivery, UserRole } from '../types';
import { Bell, Search, ChevronDown, UserCircle, Settings, Shield, AlertCircle, Truck, Package, X, CloudCheck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  user: User;
  products: Product[];
  deliveries: Delivery[];
  lowStockThreshold: number;
}

const Header: React.FC<HeaderProps> = ({ user, products, deliveries, lowStockThreshold }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  // Simulate sync indicator on state changes
  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [products, deliveries]);

  const notifications = useMemo(() => {
    const alerts: { id: string, type: 'stock' | 'delivery', title: string, details: string, path: string }[] = [];

    // Low stock alerts
    const lowStock = products.filter(p => p.stock < lowStockThreshold);
    lowStock.forEach(p => {
      alerts.push({
        id: `stock-${p.id}`,
        type: 'stock',
        title: 'Critical Stock Level',
        details: `${p.name} is low on stock (${p.stock} remaining).`,
        path: '/inventory'
      });
    });

    // In-transit transfer alerts
    const inTransit = deliveries.filter(d => d.type === 'Transfer' && d.status !== 'Delivered');
    inTransit.forEach(d => {
      alerts.push({
        id: `delivery-${d.id}`,
        type: 'delivery',
        title: 'Stock in Transit',
        details: `Transfer #${d.id} to ${d.destination} is ${d.status.toLowerCase()}.`,
        path: '/deliveries'
      });
    });

    return alerts;
  }, [products, deliveries, lowStockThreshold]);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 z-30">
      <div className="flex items-center space-x-6 flex-1">
        <div className="flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-96">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search for tools, orders, or data..." 
            className="bg-transparent border-none focus:outline-none text-sm w-full"
          />
        </div>
        
        <div className="hidden lg:flex items-center px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
          {isSyncing ? (
            <div className="flex items-center text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              Saving to Cloud...
            </div>
          ) : (
            <div className="flex items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              <CloudCheck className="w-3 h-3 mr-2" />
              All Changes Saved
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse border-2 border-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-40 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Alerts</h3>
                  <button onClick={() => setShowNotifications(false)}><X className="w-3 h-3 text-slate-400" /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <button 
                        key={notif.id}
                        onClick={() => {
                          navigate(notif.path);
                          setShowNotifications(false);
                        }}
                        className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-start space-x-3 transition-colors"
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${notif.type === 'stock' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                          {notif.type === 'stock' ? <AlertCircle className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{notif.details}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      <Package className="w-8 h-8 text-slate-200 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">All operations normal</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-slate-50 text-center">
                  <button onClick={() => {navigate('/accounting'); setShowNotifications(false);}} className="text-[10px] font-black text-blue-600 uppercase hover:underline">View System Logs</button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-[1px] bg-slate-200"></div>

        <div className="flex items-center space-x-3 group relative cursor-pointer" onClick={() => setShowProfile(!showProfile)}>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
            <p className="text-[10px] font-black text-blue-600 uppercase mt-1 tracking-wider">{user.role}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm transition-transform active:scale-95">
            <UserCircle className="w-6 h-6" />
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          
          {showProfile && (
            <>
              <div className="fixed inset-0 z-0" onClick={() => setShowProfile(false)}></div>
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 p-2 z-10">
                <div className="px-4 py-3 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Status</p>
                  <div className="flex items-center mt-1 text-emerald-600">
                    <Shield className="w-3 h-3 mr-1.5" />
                    <span className="text-[10px] font-bold">Authorized Professional</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigate('/profile');
                    setShowProfile(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
                <button 
                  onClick={() => {
                    navigate('/settings');
                    setShowProfile(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
