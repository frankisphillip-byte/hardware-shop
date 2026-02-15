
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, 
  ArrowUpRight, AlertCircle, Sparkles, ArrowRight, Activity, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Product, Sale, Expense } from '../types';
import { GoogleGenAI } from '@google/genai';
import { Link } from 'react-router-dom';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  lowStockThreshold: number;
  aiEnabled: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales, expenses, lowStockThreshold, aiEnabled }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const stats = useMemo(() => {
    const totalSales = sales.reduce((acc, curr) => acc + curr.total, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const cogs = sales.reduce((acc, s) => acc + s.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0), 0);
    const grossProfit = totalSales - cogs;
    const netProfit = grossProfit - totalExpenses;
    const margin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    const lowStockCount = products.filter(p => p.stock < lowStockThreshold).length;
    const inventoryValue = products.reduce((acc, curr) => acc + (curr.stock * curr.cost), 0);
    return { totalSales, profit: netProfit, margin, lowStockCount, inventoryValue };
  }, [products, sales, expenses, lowStockThreshold]);

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium">Global intelligence for frankisdigital enterprise.</p>
        </div>
        {aiEnabled && (
          <button 
            onClick={() => {}}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[1.5rem] flex items-center justify-center space-x-3 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 group"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-black text-sm uppercase tracking-widest">Generate Strategy</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <StatCard title="Total Revenue" value={`$${stats.totalSales.toLocaleString()}`} icon={DollarSign} color="blue" trend="+12.5%" />
        <StatCard title="Net Yield" value={`$${stats.profit.toLocaleString()}`} icon={TrendingUp} color="emerald" trend="+8.2%" />
        <StatCard title="Efficiency" value={stats.margin.toFixed(1) + '%'} icon={Activity} color="indigo" trend="Optimal" />
        <StatCard title="Stock Status" value={stats.lowStockCount.toString()} icon={AlertCircle} color="red" trend={`${stats.lowStockCount} Alerts`} warning={stats.lowStockCount > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
             {/* Abstract chart background decor */}
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
               <TrendingUp className="w-48 h-48" />
            </div>

            <div className="flex justify-between items-center mb-10 relative">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Market Analytics</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time revenue stream</p>
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} dy={15} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px'}}
                    itemStyle={{fontWeight: 900, fontSize: '14px'}}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Assets</span>
                  <Package className="w-6 h-6 text-amber-500" />
                </div>
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">${stats.inventoryValue.toLocaleString()}</h4>
                <div className="flex items-center mt-3 text-emerald-500 space-x-1">
                   <TrendingUp className="w-3 h-3" />
                   <span className="text-[10px] font-black uppercase tracking-widest">+2.4% vs last mo</span>
                </div>
             </div>
             <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all duration-700" />
                <div className="flex items-center justify-between mb-6 relative">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Profit</span>
                  <div className="p-2 bg-white/10 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <h4 className="text-4xl font-black tracking-tighter relative">${stats.profit.toLocaleString()}</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-3 relative uppercase tracking-widest">Cleared for payout</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Transaction feed</p>
            </div>
          </div>
          <div className="flex-1 space-y-8 scrollbar-hide">
            {sales.slice(-6).reverse().map((sale) => (
              <div key={sale.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 tracking-tight truncate">Ref #{sale.id}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{sale.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tracking-tighter">${sale.total.toFixed(2)}</p>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Settled</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/accounting" className="mt-10 flex items-center justify-center space-x-2 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
             <span>Audit Global Ledger</span>
             <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend, warning }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-rose-100 text-rose-600'
  };

  return (
    <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 group ${warning ? 'ring-4 ring-rose-500/10 border-rose-200' : ''}`}>
      <div className="flex justify-between items-start mb-10">
        <div className={`p-4 rounded-[1.5rem] ${colorMap[color]} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${warning ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value}</h3>
      </div>
    </div>
  );
};

export default Dashboard;
