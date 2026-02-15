
import React, { useState } from 'react';
import { Product, UserRole, LogType, StockLocation, StockHistoryEntry } from '../types';
import { CATEGORIES } from '../constants';
import { 
  Plus, Edit2, Search, Package, Check, X, AlertCircle, 
  Printer, LayoutGrid, Warehouse, ScanLine, Box, Clock, History, User, Info
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

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const saveEdit = () => {
    if (!editForm) return;
    const oldProduct = products.find(p => p.id === editForm.id);
    if (!oldProduct) return;

    let updatedProduct = { ...editForm };

    // Record stock history if stock has changed
    if (oldProduct.stock !== editForm.stock) {
      const historyEntry: StockHistoryEntry = {
        id: `H-${Date.now()}-${editForm.id}`,
        timestamp: new Date().toISOString(),
        changeAmount: editForm.stock - oldProduct.stock,
        newStock: editForm.stock,
        reason: 'Adjustment',
        userId: 'admin', // In a real app, this would be the logged-in user's ID
        userName: 'Administrator'
      };
      updatedProduct.history = [historyEntry, ...(oldProduct.history || [])].slice(0, 100);
      addLog('UPDATE', editForm.sku, `Stock adjusted manually for ${editForm.name}: ${oldProduct.stock} -> ${editForm.stock}`, 'warning');
    }

    setProducts(prev => prev.map(p => p.id === editForm.id ? updatedProduct : p));
    setEditingId(null);
    setEditForm(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    
    const initialHistory: StockHistoryEntry = {
      id: `H-${Date.now()}-init`,
      timestamp: new Date().toISOString(),
      changeAmount: editForm.stock,
      newStock: editForm.stock,
      reason: 'Initial',
      userId: 'admin',
      userName: 'Administrator'
    };

    const newProduct: Product = {
      ...editForm,
      id: `p${Date.now()}`,
      history: [initialHistory]
    };
    
    setProducts(prev => [...prev, newProduct]);
    addLog('CREATE', newProduct.sku, `New product ${newProduct.name} catalogued.`, 'success');
    setShowAddModal(false);
    setEditForm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500">Track and manage barcodes, quantities, and bulk units.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.print()}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print State</span>
          </button>
          {canEdit && (
            <button 
              onClick={() => {
                setEditForm({ id: '', name: '', category: CATEGORIES[0], price: 0, cost: 0, stock: 0, sku: '', barcode: '', boxQuantity: 1, location: selectedLocation, history: [] });
                setShowAddModal(true);
              }}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Register Product</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex p-1 bg-white border border-slate-200 rounded-2xl w-fit print:hidden">
        <button 
          onClick={() => setSelectedLocation('Shop')}
          className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all ${selectedLocation === 'Shop' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Shop Floor</span>
        </button>
        <button 
          onClick={() => setSelectedLocation('Warehouse')}
          className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all ${selectedLocation === 'Warehouse' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Main Depo</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex flex-1 items-center gap-4">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search by SKU, Name or Barcode..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${showLowStockOnly ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Low Stock Alerts</span>
            </button>
          </div>
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Tracking</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Unit Count</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right print:hidden">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => {
                const isEditing = editingId === product.id;
                const isLowStock = product.stock < lowStockThreshold;
                
                return (
                  <tr key={product.id} className={`${isLowStock ? 'bg-red-50/10' : ''} hover:bg-slate-50/50 transition-colors`}>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input className="text-sm font-bold border rounded-lg px-3 py-1.5 w-full" value={editForm?.name} onChange={(e) => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)} />
                          <div className="flex space-x-2">
                            <div className="flex-1">
                              <label className="text-[8px] font-black uppercase text-slate-400">Barcode</label>
                              <input className="text-[10px] font-mono border rounded px-2 py-1 w-full" value={editForm?.barcode} onChange={(e) => setEditForm(prev => prev ? {...prev, barcode: e.target.value} : null)} />
                            </div>
                            <div className="w-20">
                              <label className="text-[8px] font-black uppercase text-slate-400">Box Qty</label>
                              <input type="number" className="text-[10px] font-mono border rounded px-2 py-1 w-full" value={editForm?.boxQuantity} onChange={(e) => setEditForm(prev => prev ? {...prev, boxQuantity: parseInt(e.target.value) || 1} : null)} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-2xl mr-4 flex items-center justify-center font-black text-sm print:hidden ${isLowStock ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-500 border border-blue-100'}`}>
                            {product.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-tight">{product.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-1">{product.category}</p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                             <span className="text-[10px] font-black uppercase text-slate-400">SKU:</span>
                             <span className="text-xs font-mono font-bold">{product.sku}</span>
                          </div>
                          {product.barcode && (
                             <div className="flex items-center space-x-2">
                                <ScanLine className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-mono text-indigo-500 font-black">{product.barcode}</span>
                             </div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <input type="number" className="w-20 border-2 border-blue-100 rounded-lg px-3 py-2 text-center font-black text-blue-600" value={editForm?.stock} onChange={(e) => setEditForm(prev => prev ? {...prev, stock: parseInt(e.target.value) || 0} : null)} />
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className={`px-4 py-1 rounded-2xl text-sm font-black border ${isLowStock ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {product.stock}
                          </span>
                          {product.boxQuantity > 1 && (
                            <span className="text-[8px] font-black text-slate-400 uppercase mt-1">
                              ≈ {Math.floor(product.stock / product.boxQuantity)} Boxes
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right print:hidden">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => setViewingHistoryProduct(product)}
                          className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-sm transition-all"
                          title="View Audit History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        {isEditing ? (
                          <>
                            <button onClick={saveEdit} className="p-2 bg-emerald-500 text-white rounded-xl shadow-md"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-400 rounded-xl"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          canEdit && (
                            <button 
                              onClick={() => startEditing(product)} 
                              className="p-2.5 bg-white text-slate-400 hover:text-blue-600 border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock History Viewer Sidebar/Modal */}
      {viewingHistoryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Stock Audit Trail</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{viewingHistoryProduct.name}</p>
                </div>
              </div>
              <button onClick={() => setViewingHistoryProduct(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
               <div className="space-y-8 relative">
                  <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                  
                  {viewingHistoryProduct.history && viewingHistoryProduct.history.length > 0 ? (
                    viewingHistoryProduct.history.map((entry, idx) => (
                      <div key={entry.id} className="relative pl-12">
                         <div className={`absolute left-0 top-0 w-11 h-11 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm z-10 ${
                           entry.changeAmount > 0 ? 'bg-emerald-500 text-white' : 
                           entry.changeAmount < 0 ? 'bg-rose-500 text-white' : 'bg-slate-500 text-white'
                         }`}>
                            <span className="text-[10px] font-black">
                               {entry.changeAmount > 0 ? `+${entry.changeAmount}` : entry.changeAmount}
                            </span>
                         </div>
                         
                         <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                               <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                 entry.reason === 'Sale' ? 'bg-rose-100 text-rose-700' :
                                 entry.reason === 'Receipt' ? 'bg-emerald-100 text-emerald-700' :
                                 entry.reason === 'Initial' ? 'bg-indigo-100 text-indigo-700' :
                                 'bg-amber-100 text-amber-700'
                               }`}>
                                  {entry.reason}
                               </span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                  {new Date(entry.timestamp).toLocaleString()}
                               </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 flex items-center">
                               {entry.reason === 'Sale' ? 'Customer Order Fulfillment' :
                                entry.reason === 'Receipt' ? 'Supplier Inventory Inbound' :
                                entry.reason === 'Initial' ? 'Catalog Initialization' :
                                'Manual Database Override'}
                            </p>
                            {entry.referenceId && (
                              <p className="text-[10px] text-indigo-600 font-black mt-1 uppercase">Ref: {entry.referenceId}</p>
                            )}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                               <div className="flex items-center space-x-2">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span className="text-[10px] font-black text-slate-500 uppercase">{entry.userName}</span>
                               </div>
                               <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-black text-slate-400 uppercase">New Bal:</span>
                                  <span className="text-xs font-black text-slate-900">{entry.newStock}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4">
                       <History className="w-12 h-12 mx-auto text-slate-200" />
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-10">
                          No audit entries found for this product. Movement tracking starts from the first transaction.
                       </p>
                    </div>
                  )}
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
               <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Stock Ledger</p>
                    <p className="text-2xl font-black text-slate-900">{viewingHistoryProduct.stock} Units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global SKU</p>
                    <p className="text-sm font-mono font-bold text-indigo-600">{viewingHistoryProduct.sku}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8 flex items-center">
              <Package className="w-6 h-6 mr-3 text-blue-600" />
              Register Inventory
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Full Product Name</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none" value={editForm?.name} onChange={e => setEditForm({...editForm!, name: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">SKU Reference</label>
                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-mono font-bold" value={editForm?.sku} onChange={e => setEditForm({...editForm!, sku: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Category</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold" value={editForm?.category} onChange={e => setEditForm({...editForm!, category: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                      <ScanLine className="w-3 h-3 mr-1.5 text-indigo-500" />
                      Barcode Value
                    </label>
                    <input className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl px-5 py-3.5 text-sm font-mono font-bold text-indigo-600" value={editForm?.barcode} onChange={e => setEditForm({...editForm!, barcode: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                      <Box className="w-3 h-3 mr-1.5 text-amber-500" />
                      Box Quantity (Units/Box)
                    </label>
                    <input type="number" className="w-full bg-amber-50/50 border border-amber-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-amber-700" value={editForm?.boxQuantity} onChange={e => setEditForm({...editForm!, boxQuantity: parseInt(e.target.value) || 1})} />
                  </div>
               </div>
               <div className="pt-6 flex space-x-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all">Register Product</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
