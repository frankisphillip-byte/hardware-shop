
import React, { useState, useMemo, useRef } from 'react';
import { Product, UserRole, LogType, StockLocation, StockHistoryEntry, Branch } from '../types';
import { CATEGORIES } from '../constants';
import { 
  Plus, Search, Package, Check, X, Printer, LayoutGrid, Warehouse, Box, ChevronRight,
  ChevronLeft, Barcode, DollarSign, Tag, Camera, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  role: UserRole;
  addLog: (type: LogType, target: string, details: string, severity?: 'info' | 'warning' | 'success' | 'danger') => void;
  lowStockThreshold: number;
  branches?: Branch[];
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, role, addLog, lowStockThreshold, branches = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState<StockLocation>('Shop');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', category: CATEGORIES[0], price: 0, cost: 0, stock: 0, 
    sku: '', barcode: '', boxQuantity: 1, location: 'Shop', history: []
  });

  // AI Scanning States
  const [showAIScanner, setShowAIScanner] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const canEdit = role === UserRole.ADMIN || role === UserRole.WAREHOUSE_CLERK;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.barcode && p.barcode.includes(searchTerm));
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesLowStock = !showLowStockOnly || p.stock < lowStockThreshold;
      const matchesLocation = p.location === selectedLocation;
      return matchesSearch && matchesCategory && matchesLowStock && matchesLocation;
    });
  }, [products, searchTerm, selectedCategory, showLowStockOnly, selectedLocation, lowStockThreshold]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const startAIScanner = async () => {
    setShowAIScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setShowAIScanner(false);
    }
  };

  const stopAIScanner = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setShowAIScanner(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsAnalyzing(true);
    
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: `Extract product details for hardware inventory registration. Categories available: ${CATEGORIES.join(', ')}. Return ONLY a JSON object with properties: name, category, price, cost, sku, barcode. If data missing, estimate or leave empty string.` }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      setNewProduct(prev => ({
        ...prev,
        name: result.name || prev.name,
        category: CATEGORIES.includes(result.category) ? result.category : prev.category,
        price: Number(result.price) || prev.price,
        cost: Number(result.cost) || prev.cost,
        sku: result.sku || prev.sku,
        barcode: result.barcode || prev.barcode
      }));
      
      stopAIScanner();
      setShowAddModal(true);
    } catch (err) {
      console.error(err);
      alert("AI recognition failed. Please enter manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) return;
    
    const prod: Product = {
      ...newProduct as Product,
      id: `p-${Date.now()}`,
      history: [{
        id: `H-INT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        changeAmount: newProduct.stock || 0,
        newStock: newProduct.stock || 0,
        reason: 'Initial',
        userId: 'u1',
        userName: 'Admin'
      }]
    };

    setProducts(prev => [prod, ...prev]);
    addLog('CREATE', 'INVENTORY', `Resource ${prod.name} registered.`, 'success');
    setShowAddModal(false);
    setNewProduct({
      name: '', category: CATEGORIES[0], price: 0, cost: 0, stock: 0, 
      sku: '', barcode: '', boxQuantity: 1, location: 'Shop', history: []
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Asset Ledger</h1>
          <p className="text-slate-500 font-medium tracking-tight">Monitoring {products.length.toLocaleString()} individual records.</p>
        </div>
        <div className="flex items-center space-x-3">
          {canEdit && (
            <button 
              onClick={startAIScanner} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl flex items-center space-x-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-black text-xs uppercase tracking-widest">AI Vision Onboard</span>
            </button>
          )}
          {canEdit && (
            <button onClick={() => setShowAddModal(true)} className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl flex items-center space-x-3 transition-all shadow-2xl active:scale-95">
              <Plus className="w-5 h-5" />
              <span className="font-black text-xs uppercase tracking-widest text-white">Manual Add</span>
            </button>
          )}
        </div>
      </div>

      {showAIScanner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden relative border border-slate-800 shadow-2xl">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-3 text-white">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-black tracking-tight">AI Asset Registration</h3>
              </div>
              <button onClick={stopAIScanner} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="aspect-video relative bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-indigo-500/30 m-8 rounded-3xl pointer-events-none" />
            </div>
            <div className="p-10 flex flex-col items-center space-y-6 bg-slate-900 text-center">
              <div className="flex items-center space-x-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Capture Product Label or Design</span>
              </div>
              <p className="text-slate-400 text-xs">AI will automatically extract the name, category, and pricing estimates.</p>
              <button 
                onClick={captureAndAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                <span>{isAnalyzing ? 'Extracting Data...' : 'Capture & Identify'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col xl:flex-row gap-4">
          <div className="flex flex-1 items-center bg-white border border-slate-200 rounded-[2rem] px-6 py-4 shadow-sm focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-4" />
            <input type="text" placeholder="SKU, Name, or Barcode figures..." className="bg-transparent border-none focus:outline-none text-sm w-full font-bold" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex flex-wrap gap-3">
             <div className="flex p-1.5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
                <button onClick={() => { setSelectedLocation('Shop'); setCurrentPage(1); }} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${selectedLocation === 'Shop' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <LayoutGrid className="w-4 h-4" />
                  <span>Shop</span>
                </button>
                <button onClick={() => { setSelectedLocation('Warehouse'); setCurrentPage(1); }} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${selectedLocation === 'Warehouse' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Warehouse className="w-4 h-4" />
                  <span>Warehouse</span>
                </button>
             </div>
             <select className="bg-white border border-slate-200 rounded-[1.5rem] px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] focus:outline-none shadow-sm" value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics Data</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Net Balance</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Retail Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedProducts.map(product => (
                <tr key={product.id} className={`${product.stock < lowStockThreshold ? 'bg-rose-50/20' : ''} hover:bg-slate-50/50 transition-colors group`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-2xl mr-4 flex items-center justify-center font-black text-base shadow-sm ${product.stock < lowStockThreshold ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                        {product.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 tracking-tight leading-tight">{product.name}</p>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1 block">{product.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-[10px] font-black text-slate-500">
                    <div className="space-y-1.5">
                       <p className="flex items-center"><span className="w-12 opacity-40">SKU</span> <span className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{product.sku}</span></p>
                       <p className="flex items-center text-indigo-500"><span className="w-12 opacity-40">BAR</span> <span>{product.barcode}</span></p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-5 py-2 rounded-2xl text-xs font-black border shadow-sm ${product.stock < lowStockThreshold ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      {product.stock.toLocaleString()} UNITS
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900 text-sm">
                    ${product.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
             <button 
               onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
               disabled={currentPage === 1}
               className="p-3 rounded-xl border border-slate-100 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               Page {currentPage} of {totalPages}
             </span>
             <button 
               onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
               disabled={currentPage === totalPages}
               className="p-3 rounded-xl border border-slate-100 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600 border border-slate-100">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Resource Registration</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Review AI extracted details or manually correct</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleSaveNewProduct} className="p-10 space-y-10 overflow-y-auto flex-1 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Product Name</label>
                      <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Category</label>
                         <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                       </div>
                       <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">SKU Code</label>
                         <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black uppercase" value={newProduct.sku} onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Barcode</label>
                         <div className="relative">
                            <Barcode className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold" value={newProduct.barcode} onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})} />
                         </div>
                       </div>
                       <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Initial Stock</label>
                         <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} />
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-8">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Parameters</h4>
                       <DollarSign className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Acquisition Cost</label>
                         <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-rose-500" value={newProduct.cost} onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})} />
                       </div>
                       <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Retail Price</label>
                         <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-emerald-600" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})} />
                       </div>
                    </div>
                    <div className="pt-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Station Deployment</label>
                       <div className="flex p-1 bg-white border border-slate-200 rounded-2xl">
                          <button type="button" onClick={() => setNewProduct({...newProduct, location: 'Shop'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${newProduct.location === 'Shop' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Shop</button>
                          <button type="button" onClick={() => setNewProduct({...newProduct, location: 'Warehouse'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${newProduct.location === 'Warehouse' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Warehouse</button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-10 flex space-x-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Discard</button>
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                  Commit Product to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
