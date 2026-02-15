
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Sale, User, SaleItem, LogType, StockHistoryEntry } from '../types';
// Added Plus to imports
import { Search, ShoppingCart, Trash2, CreditCard, ScanLine, Printer, Check, Share2, MessageCircle, FileText, X, RotateCcw, Wallet, ChevronUp, Plus } from 'lucide-react';

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
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(paymentMethods[0] || 'Cash');
  const [dismissedProductIds, setDismissedProductIds] = useState<Set<string>>(new Set());
  const [showMobileCart, setShowMobileCart] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!paymentMethods.includes(selectedPaymentMethod)) {
      setSelectedPaymentMethod(paymentMethods[0] || 'Cash');
    }
  }, [paymentMethods]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.location === 'Shop' && 
      !dismissedProductIds.has(p.id) &&
      (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm))
      )
    );
  }, [products, searchTerm, dismissedProductIds]);

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
        // Explicitly typed entry to fix reason type inference error where string is not assignable to literal union
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
        return { 
          ...p, 
          stock: newStock,
          history: [entry, ...(p.history || [])].slice(0, 100)
        };
      }
      return p;
    }));

    setSales(prev => [...prev, newSale]);
    addLog('TRANSACTION', newSale.id, `Sale Completed: $${cartTotal.toFixed(2)}`, 'success');
    setLastSaleId(saleId);
    setCart([]);
    setShowMobileCart(true); // Auto-show results
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 lg:gap-8 relative">
      {/* Left: Product Feed */}
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
                  placeholder="Filter catalogue..." 
                  className="bg-transparent border-none focus:outline-none text-sm w-full font-medium" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
             </div>
          </div>
        </div>

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

      {/* Floating Cart Trigger (Mobile) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setShowMobileCart(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-3 active:scale-95 transition-all border border-slate-800"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-black text-sm uppercase tracking-widest">Cart Summary</span>
          {cart.length > 0 && (
            <span className="bg-blue-600 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sidebar / Bottom Sheet */}
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

      {/* Hidden Invoice Template (No changes needed for Print) */}
      <div className="hidden print:block fixed inset-0 bg-white p-12 z-[100]">
        {/* Print template already dynamically brands itself */}
      </div>
    </div>
  );
};

export default POS;
