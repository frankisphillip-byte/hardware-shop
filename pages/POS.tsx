
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Sale, User, SaleItem, LogType, StockHistoryEntry } from '../types';
import { Search, ShoppingCart, Trash2, CreditCard, ScanLine, Printer, Check, FileText, X, Plus, Camera, Loader2, Barcode } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface POSProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  currentUser: User;
  addLog: (type: LogType, target: string, details: string, severity?: 'info' | 'warning' | 'success' | 'danger') => void;
  taxRate: number;
  storeName: string;
  paymentMethods: string[];
}

const POS: React.FC<POSProps> = ({ products, setProducts, sales, setSales, currentUser, addLog, taxRate, storeName, paymentMethods }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(paymentMethods[0] || 'Cash');
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  // Camera States
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!paymentMethods.includes(selectedPaymentMethod)) {
      setSelectedPaymentMethod(paymentMethods[0] || 'Cash');
    }
  }, [paymentMethods]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.location === 'Shop' && 
      (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm))
      )
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return alert("Out of stock!");
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Maximum available stock reached.");
          return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        price: product.price,
        cost: product.cost 
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const startScanner = async () => {
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setShowScanner(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setShowScanner(false);
  };

  const performAIScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: "Identify the product or barcode in this image. Return ONLY a JSON object with 'barcode' or 'sku' or 'name' string found. Example: {\"query\": \"5012345678901\"}" }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      const query = result.query || result.barcode || result.sku || result.name;
      
      if (query) {
        const found = products.find(p => 
          p.barcode === query || 
          p.sku === query || 
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        if (found) {
          addToCart(found);
          addLog('SCAN', found.id, `AI detected product: ${found.name}`, 'success');
          stopScanner();
        } else {
          setSearchTerm(query);
          alert(`Detected: "${query}", but no exact match in inventory.`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("AI scanning failed. Try manual entry.");
    } finally {
      setIsScanning(false);
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartTax = cartSubtotal * (taxRate / 100);
  const cartTotal = cartSubtotal + cartTax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const saleId = `S${Date.now().toString().slice(-6)}`;
    const newSale: Sale = { 
      id: saleId, 
      date: new Date().toISOString().split('T')[0], 
      items: [...cart], 
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal, 
      cashierId: currentUser.id,
      paymentMethod: selectedPaymentMethod
    };
    
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.productId === p.id);
      if (cartItem) {
        const newStock = p.stock - cartItem.quantity;
        const entry: StockHistoryEntry = {
          id: `H-${Date.now()}-${p.id}`,
          timestamp: new Date().toISOString(),
          changeAmount: -cartItem.quantity,
          newStock: newStock,
          reason: 'Sale',
          referenceId: saleId,
          userId: currentUser.id,
          userName: currentUser.name
        };
        return { ...p, stock: newStock, history: [entry, ...(p.history || [])].slice(0, 100) };
      }
      return p;
    }));

    setSales(prev => [...prev, newSale]);
    addLog('TRANSACTION', newSale.id, `Sale Completed: $${cartTotal.toFixed(2)}`, 'success');
    setLastSaleId(saleId);
    setCart([]);
    setShowMobileCart(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 lg:gap-8 relative">
      <div className="flex-1 flex flex-col space-y-6 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Shop Floor</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live Inventory Access</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="flex items-center bg-slate-100/50 border border-slate-200 rounded-2xl px-5 py-2.5 w-full sm:w-64 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Barcode figures or name..." 
                  className="bg-transparent border-none focus:outline-none text-sm w-full font-medium" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
             </div>
             <button 
               onClick={startScanner}
               className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2"
               title="Open Camera Scanner"
             >
               <Camera className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-widest sm:hidden">Scanner</span>
             </button>
          </div>
        </div>

        {showScanner && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in">
            <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden relative border border-slate-800 shadow-2xl">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center space-x-3 text-white">
                  <ScanLine className="w-6 h-6 text-blue-500 animate-pulse" />
                  <h3 className="text-xl font-black tracking-tighter">AI Visual Terminal</h3>
                </div>
                <button onClick={stopScanner} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"><X className="w-6 h-6" /></button>
              </div>
              <div className="aspect-video relative bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-[3px] border-dashed border-blue-500/40 m-12 pointer-events-none rounded-[2rem]" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="p-10 flex flex-col items-center space-y-6 bg-slate-900">
                <p className="text-slate-400 text-xs font-medium text-center max-w-sm">Position product or barcode in the frame. AI will identify the item and sync with inventory.</p>
                <button 
                  onClick={performAIScan}
                  disabled={isScanning}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isScanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  <span>{isScanning ? 'Analyzing Scene...' : 'Authorize Frame Capture'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 overflow-y-auto pr-2 pb-24 lg:pb-6 scrollbar-hide">
          {filteredProducts.map(product => (
            <button 
              key={product.id} 
              onClick={() => addToCart(product)} 
              className={`group p-5 bg-white border border-slate-100 rounded-[2rem] text-left hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all relative ${product.stock <= 0 ? 'opacity-40 grayscale pointer-events-none' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">{product.category}</span>
                <span className={`text-[10px] font-black ${product.stock < 5 ? 'text-rose-500' : 'text-slate-400'}`}>Q: {product.stock}</span>
              </div>
              <h4 className="font-black text-slate-900 line-clamp-2 text-sm md:text-base leading-tight min-h-[2.5rem]">{product.name}</h4>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-black text-slate-900 tracking-tighter">${product.price.toFixed(2)}</p>
                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching products found</p>
            </div>
          )}
        </div>
      </div>

      <div className={`
        fixed lg:relative inset-x-0 bottom-0 lg:inset-auto z-40 lg:z-0 lg:w-[400px] h-[90vh] lg:h-full bg-white border border-slate-200 rounded-t-[3rem] lg:rounded-[3rem] flex flex-col shadow-2xl overflow-hidden transition-transform duration-500 ease-in-out
        ${showMobileCart ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
      `}>
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-3">
             <ShoppingCart className="w-6 h-6 text-blue-600" />
             <h3 className="text-xl font-black tracking-tight">Active Ticket</h3>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => { setCart([]); setLastSaleId(null); }} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
            <button onClick={() => setShowMobileCart(false)} className="lg:hidden p-3 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {cart.length === 0 && !lastSaleId ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-sm font-bold uppercase tracking-widest">Basket is empty</p>
            </div>
          ) : lastSaleId ? (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="font-black text-emerald-900 text-xl tracking-tight leading-none mb-1">Sale Settled</h4>
              <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest">Ref: {lastSaleId}</p>
              
              <div className="mt-10 space-y-3">
                <button onClick={() => window.print()} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-3 hover:bg-blue-700 transition-all">
                  <FileText className="w-5 h-5" />
                  <span>Download Invoice</span>
                </button>
                <button onClick={() => setLastSaleId(null)} className="w-full py-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-600 pt-6">Begin Next Turn</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center bg-slate-50 p-5 rounded-3xl border border-slate-100 group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">${item.price.toFixed(2)} / unit</p>
                  </div>
                  <div className="flex items-center space-x-4 ml-6">
                    <div className="text-right">
                       <p className="font-black text-sm tracking-tight">${(item.price * item.quantity).toFixed(2)}</p>
                       <span className="text-[10px] font-black bg-white px-3 py-1.5 rounded-xl border border-slate-200 inline-block mt-1">x{item.quantity}</span>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!lastSaleId && (
          <div className="p-8 bg-slate-100/50 border-t border-slate-200 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Select Payment Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(method => (
                  <button
                    key={method}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black border transition-all truncate uppercase tracking-widest ${
                      selectedPaymentMethod === method 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                        : 'bg-white text-slate-500 border-slate-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Subtotal</span>
                <span className="font-bold text-slate-900">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Provision ({taxRate}%)</span>
                <span className="font-bold text-slate-900">${cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Payable Amount</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={cart.length === 0} 
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50 active:scale-95 group"
            >
              <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-sm">Authorize Settlement</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default POS;
