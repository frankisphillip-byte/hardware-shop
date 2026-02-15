
import React, { useState, useMemo, useEffect } from 'react';
import { User, Product, Delivery, UserRole } from '../types';
import { Bell, Search, ChevronDown, UserCircle, Settings, Shield, AlertCircle, Truck, Package, X, CloudCheck, RefreshCw, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  user: User;
  products: Product[];
  deliveries: Delivery[];
  lowStockThreshold: number;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, products, deliveries, lowStockThreshold, onMenuToggle }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [products, deliveries]);

  const notifications = useMemo(() => {
    const alerts: { id: string, type: 'stock' | 'delivery', title: string, details: string, path: string }[] = [];
    const lowStock = products.filter(p => p.stock < lowStockThreshold);
    lowStock.forEach(p => {
      alerts.push({
        id: `stock-${p.id}`,
        type: 'stock',
        title: 'Low Stock Alert',
        details: `${p.name} is down to ${p.stock} units.`,
        path: '/inventory'
      });
    });
    const inTransit = deliveries.filter(d => d.type === 'Transfer' && d.status !== 'Delivered');
    inTransit.forEach(d => {
      alerts.push({
        id: `delivery-${d.id}`,
        type: 'delivery',
        title: 'Inbound Transfer',
        details: `Transfer #${d.id} is ${d.status.toLowerCase()}.`,
        path: '/deliveries'
      });
    });
    return alerts;
  }, [products, deliveries, lowStockThreshold]);

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-4 md:px-8 z-30 shadow-sm">
      <div className="flex items-center space-x-4 flex-1">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-3 bg-slate-50 text-slate-600 rounded-2xl border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 w-full max-w-md shadow-inner focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Universal search..." 
            className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
          />
        </div>
        
        <div className="hidden xl:flex items-center px-4 py-2 bg-slate-50/50 border border-slate-100 rounded-2xl">
          {isSyncing ? (
            <div className="flex items-center text-[9px] font-black text-blue-500 uppercase tracking-[0.15em] animate-pulse">
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              Syncing Ledger...
            </div>
          ) : (
            <div className="flex items-center text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em]">
              <CloudCheck className="w-3 h-3 mr-2" />
              Cloud Synchronized
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-2xl transition-all ${showNotifications ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-bounce border-2 border-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute top-full right-0 mt-4 w-80 bg-white border border-slate-200 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-40 overflow-hidden ring-1 ring-slate-900/5">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Alerts</h3>
                  <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <button 
                        key={notif.id}
                        onClick={() => {
                          navigate(notif.path);
                          setShowNotifications(false);
                        }}
                        className="w-full text-left p-5 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-start space-x-4 transition-colors group"
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform ${notif.type === 'stock' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                          {notif.type === 'stock' ? <AlertCircle className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 tracking-tight">{notif.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">{notif.details}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-10 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <Package className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">System Clear</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

        <div className="flex items-center space-x-3 group relative cursor-pointer" onClick={() => setShowProfile(!showProfile)}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none">{user.name}</p>
            <p className="text-[9px] font-black text-blue-600 uppercase mt-1 tracking-widest opacity-80">{user.role}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all active:scale-95 overflow-hidden">
             {/* Dynamic Initial or Avatar placeholder */}
             <span className="font-black text-lg">{user.name.charAt(0)}</span>
          </div>
          
          {showProfile && (
            <>
              <div className="fixed inset-0 z-0" onClick={() => setShowProfile(false)}></div>
              <div className="absolute top-full right-0 mt-4 w-64 bg-white border border-slate-200 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 p-3 z-40 ring-1 ring-slate-900/5">
                <div className="px-5 py-4 border-b border-slate-100 mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Authorization</p>
                  <div className="flex items-center text-emerald-600">
                    <Shield className="w-3.5 h-3.5 mr-2" />
                    <span className="text-[11px] font-black tracking-tight">Verified Enterprise Professional</span>
                  </div>
                </div>
                <button 
                  onClick={() => { navigate('/profile'); setShowProfile(false); }}
                  className="w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-4 transition-all"
                >
                  <UserCircle className="w-5 h-5 opacity-60" />
                  <span>My Identity</span>
                </button>
                <button 
                  onClick={() => { navigate('/settings'); setShowProfile(false); }}
                  className="w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-4 transition-all"
                >
                  <Settings className="w-5 h-5 opacity-60" />
                  <span>Config Center</span>
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
