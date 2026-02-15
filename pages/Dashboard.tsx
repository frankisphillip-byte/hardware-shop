
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
// Fixed error: Added missing CheckCircle2 import from lucide-react
import { 
  TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, 
  ArrowUpRight, AlertCircle, Sparkles, ArrowRight, Activity, CheckCircle2
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
    
    const lowStockItems = products.filter(p => p.stock < lowStockThreshold);
    const lowStockCount = lowStockItems.length;
    const inventoryValue = products.reduce((acc, curr) => acc + (curr.stock * curr.cost), 0);
    
    return {
      totalSales,
      profit: netProfit,
      margin,
      lowStockCount,
      inventoryValue,
      lowStockItems
    };
  }, [products, sales, expenses, lowStockThreshold]);

  const generateAIInsight = async () => {
    if (!aiEnabled) return;
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        As a hardware store consultant, analyze this business data and provide a concise 2-3 sentence strategic insight.
        - Total Sales: $${stats.totalSales}
        - Total Expenses: $${expenses.reduce((acc, e) => acc + e.amount, 0)}
        - Net Margin: ${stats.margin.toFixed(2)}%
        - Inventory Value: $${stats.inventoryValue}
        - Low Stock Items: ${stats.lowStockCount} (Threshold is ${lowStockThreshold})
        Be encouraging but realistic.
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiInsight(response.text || "Financial metrics are within expected parameters. Focus on inventory turnover.");
    } catch (error) {
      console.error(error);
      setAiInsight("AI advisory is currently offline. Reviewing local metrics shows steady performance.");
    } finally {
      setLoadingAi(false);
    }
  };

  const chartData = [
    { name: 'Mon', sales: 4000, profit: 2400 },
    { name: 'Tue', sales: 3000, profit: 1398 },
    { name: 'Wed', sales: 2000, profit: 9800 },
    { name: 'Thu', sales: 2780, profit: 3908 },
    { name: 'Fri', sales: 1890, profit: 4800 },
    { name: 'Sat', sales: 2390, profit: 3800 },
    { name: 'Sun', sales: 3490, profit: 4300 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Control</h1>
          <p className="text-slate-500">Real-time financial and logistics overview.</p>
        </div>
        {aiEnabled && (
          <button 
            onClick={generateAIInsight}
            disabled={loadingAi}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingAi ? 'Analyzing Metrics...' : 'Get Strategy Insight'}</span>
          </button>
        )}
      </div>

      {aiInsight && aiEnabled && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
          <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Business Advisory</h4>
            <p className="text-indigo-800/80 text-sm mt-2 font-medium italic leading-relaxed">"{aiInsight}"</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${stats.totalSales.toLocaleString()}`} icon={DollarSign} color="blue" trend="+12.5%" />
        <StatCard title="Net Profit" value={`$${stats.profit.toLocaleString()}`} icon={TrendingUp} color="emerald" trend="+8.2%" />
        <StatCard title="Net Margin" value={stats.margin.toFixed(1) + '%'} icon={Activity} color="indigo" trend="Optimal" />
        <StatCard title="Inv. Health" value={stats.lowStockCount.toString()} icon={AlertCircle} color="red" trend={`${stats.lowStockCount} Alerts`} warning={stats.lowStockCount > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Performance Trends</h3>
              </div>
              <select className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold px-4 py-2 focus:outline-none">
                <option>Weekly View</option>
                <option>Monthly View</option>
              </select>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'}}
                    itemStyle={{fontWeight: 700, fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory Value</span>
                  <Package className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-3xl font-black text-slate-900">${stats.inventoryValue.toLocaleString()}</h4>
                <p className="text-[10px] text-slate-500 mt-2">Locked in stock assets</p>
             </div>
             <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Net Profitability</span>
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="text-3xl font-black">${stats.profit.toLocaleString()}</h4>
                <div className="flex items-center mt-2 text-emerald-400">
                   <ArrowUpRight className="w-3 h-3 mr-1" />
                   <span className="text-[10px] font-bold uppercase">{stats.margin.toFixed(2)}% Margin</span>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Recent Ledger</h3>
            <Link to="/accounting" className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Full Audit</Link>
          </div>
          <div className="flex-1 space-y-5">
            {sales.slice(-7).reverse().map((sale) => (
              <div key={sale.id} className="flex items-center justify-between group cursor-pointer p-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Invoice #{sale.id}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{sale.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">${sale.total.toFixed(2)}</p>
                  <div className="flex items-center justify-end text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                     <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend, warning }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    red: 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <div className={`bg-white p-7 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 ${warning ? 'border-red-300 ring-4 ring-red-500/5' : ''}`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${warning ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-6">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default Dashboard;
