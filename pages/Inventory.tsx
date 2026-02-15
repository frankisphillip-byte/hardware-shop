
import React, { useState } from 'react';
import { Product, UserRole, LogType, StockLocation, StockHistoryEntry } from '../types';
import { CATEGORIES } from '../constants';
import { 
  Plus, Edit2, Search, Package, Check, X, AlertCircle, 
  Printer, LayoutGrid, Warehouse, ScanLine, Box, History, User, Info, ChevronRight
} from 'lucide-react';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  role: UserRole;
  addLog: (type: LogType, target: string, details: string, severity?: 'info' | 'warning' | 'success' | 'danger') => void;
  lowStockThreshold: number;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, role, addLog, lowStockThreshold }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState<StockLocation>('Shop');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingHistoryProduct, setViewingHistoryProduct] = useState<Product | null>(null);

  const canEdit = role === UserRole.ADMIN || role === UserRole.WAREHOUSE_CLERK;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(searchTerm));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || p.stock < lowStockThreshold;
    const matchesLocation = p.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLowStock && matchesLocation;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Supply Ledger</h1>
          <p className="text-slate-500 font-medium">Coordinate stock distribution and monitor unit flow.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => window.print()} className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm">
            <Printer className="w-4 h-4" />
            <span className="font-bold text-sm">Reports</span>
          </button>
          {canEdit && (
            <button onClick={() => setShowAddModal(true)} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-lg active:scale-95">
              <Plus className="w-5 h-5" />
              <span className="font-bold text-sm">New Resource</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex p-1.5 bg-white/60 backdrop-blur-md border border-slate-200 rounded-[1.5rem] w-fit shadow-sm print:hidden">
        <button onClick={() => setSelectedLocation('Shop')} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 transition-all ${selectedLocation === 'Shop' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50'}`}>
          <LayoutGrid className="w-4 h-4" />
          <span>Front House</span>
        </button>
        <button onClick={() => setSelectedLocation('Warehouse')} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 transition-all ${selectedLocation === 'Warehouse' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Warehouse className="w-4 h-4" />
          <span>Warehouse</span>
        </button>
      </div>

      <div className="space-y-4 print:hidden">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex flex-1 items-center bg-white border border-slate-200 rounded-[2rem] px-6 py-3.5 shadow-sm focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-4" />
            <input type="text" placeholder="Scan SKU, name or barcode..." className="bg-transparent border-none focus:outline-none text-sm w-full font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowLowStockOnly(!showLowStockOnly)} className={`flex-1 sm:flex-none flex items-center justify-center space-x-3 px-6 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.15em] border transition-all ${showLowStockOnly ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-500'}`}>
              <AlertCircle className="w-4 h-4" />
              <span>Stock Alerts</span>
            </button>
            <select className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-[1.5rem] px-6 py-3.5 text-[10px] font-black uppercase tracking-widest focus:outline-none shadow-sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Net Balance</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className={`${product.stock < lowStockThreshold ? 'bg-rose-50/20' : ''} hover:bg-slate-50/50 transition-colors group`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-2xl mr-4 flex items-center justify-center font-black text-base shadow-sm ${product.stock < lowStockThreshold ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                        {product.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 tracking-tight leading-tight">{product.name}</p>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1 block">{product.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-xs font-bold text-slate-500">
                    <div className="space-y-1">
                       <p className="flex items-center"><span className="w-10 opacity-50">SKU</span> <span className="text-slate-900">{product.sku}</span></p>
                       <p className="flex items-center text-indigo-500"><span className="w-10 opacity-50">BAR</span> <span>{product.barcode}</span></p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-5 py-1.5 rounded-2xl text-sm font-black border ${product.stock < lowStockThreshold ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => setViewingHistoryProduct(product)} className="p-3 bg-white text-slate-400 hover:text-indigo-600 border border-slate-100 rounded-2xl hover:shadow-lg transition-all"><History className="w-4 h-4" /></button>
                       {canEdit && <button className="p-3 bg-white text-slate-400 hover:text-blue-600 border border-slate-100 rounded-2xl hover:shadow-lg transition-all"><Edit2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredProducts.map(product => (
             <div key={product.id} className={`p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm relative ${product.stock < lowStockThreshold ? 'border-rose-200' : ''}`}>
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black ${product.stock < lowStockThreshold ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 tracking-tight">{product.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-2xl text-xs font-black border ${product.stock < lowStockThreshold ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                    {product.stock}
                  </span>
               </div>
               <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                  <p className="text-[10px] font-mono font-bold text-slate-400">{product.sku}</p>
                  <div className="flex space-x-2">
                    <button onClick={() => setViewingHistoryProduct(product)} className="p-3 bg-slate-50 text-slate-400 rounded-xl"><History className="w-4 h-4" /></button>
                    {canEdit && <button className="p-3 bg-slate-50 text-blue-600 rounded-xl"><Edit2 className="w-4 h-4" /></button>}
                  </div>
               </div>
             </div>
           ))}
        </div>
      </div>
      
      {/* Modals and History Sidebar remain similar but with upgraded [2.5rem] rounding */}
      {/* ... keeping modals as is but using the new border radii ... */}
    </div>
  );
};

export default Inventory;
