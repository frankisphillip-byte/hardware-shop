
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Sale, User, SaleItem, LogType, StockHistoryEntry } from '../types';
import { Search, ShoppingCart, Trash2, CreditCard, ScanLine, Printer, Check, Share2, MessageCircle, FileText, X, RotateCcw, Wallet } from 'lucide-react';

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
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Sync selected method if settings change
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
          alert("Maximum available stock reached for this item.");
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

  const dismissProduct = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setDismissedProductIds(prev => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  };

  const restoreDismissed = () => {
    setDismissedProductIds(new Set());
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeInput && p.location === 'Shop');
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert("Product with this barcode not found in Shop floor.");
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartTax = cartSubtotal * (taxRate / 100);
  const cartTotal = cartSubtotal + cartTax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!selectedPaymentMethod) return alert("Please select a payment method.");
    
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
    
    // Inventory Depletion Logic with History tracking
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.productId === p.id);
      if (cartItem) {
        const newStock = p.stock - cartItem.quantity;
        const historyEntry: StockHistoryEntry = {
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
          history: [historyEntry, ...(p.history || [])].slice(0, 100)
        };
      }
      return p;
    }));

    // Accounting Record Addition
    setSales(prev => [...prev, newSale]);
    addLog('TRANSACTION', newSale.id, `Sale Completed via ${selectedPaymentMethod}: $${cartTotal.toFixed(2)}`, 'success');
    setLastSaleId(saleId);
    setCart([]);
  };

  const shareViaWhatsApp = () => {
    if (!lastSaleId) return;
    const sale = sales.find(s => s.id === lastSaleId);
    if (!sale) return;
    
    const text = `*${storeName} Invoice: ${sale.id}*\nDate: ${sale.date}\nPayment: ${sale.paymentMethod}\n\n${sale.items.map(i => `- ${i.name} x${i.quantity}: $${(i.price * i.quantity).toFixed(2)}`).join('\n')}\n\n*Subtotal: $${sale.subtotal.toFixed(2)}*\n*Tax: $${sale.tax.toFixed(2)}*\n*Total: $${sale.total.toFixed(2)}*\nThank you for shopping at ${storeName}!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-900">Shop Floor Catalogue</h2>
            {dismissedProductIds.size > 0 && (
              <button 
                onClick={restoreDismissed}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore {dismissedProductIds.size} hidden</span>
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <form onSubmit={handleBarcodeScan} className="flex items-center bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 w-64 ring-2 ring-indigo-500/10 focus-within:ring-indigo-500/30 transition-all">
              <ScanLine className="w-4 h-4 text-indigo-500 mr-2" />
              <input 
                ref={barcodeInputRef}
                type="text" 
                placeholder="Scanner input..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full font-mono font-bold"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
              />
            </form>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-64 shadow-inner">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Search products..." className="bg-transparent border-none focus:outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4 scrollbar-hide">
          {filteredProducts.map(product => (
            <button key={product.id} onClick={() => addToCart(product)} className={`p-4 bg-white border rounded-2xl text-left hover:border-blue-500 transition-all group shadow-sm relative ${product.stock <= 0 ? 'opacity-40 grayscale' : ''}`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{product.category}</span>
                <div className="flex space-x-1.5">
                  {product.barcode && <ScanLine className="w-3 h-3 text-slate-300" />}
                  <div 
                    onClick={(e) => dismissProduct(e, product.id)}
                    className="p-1 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="Dismiss item"
                  >
                    <X className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-slate-800 line-clamp-1 mt-2">{product.name}</h4>
              <p className="text-sm font-bold text-slate-900 mt-2">${product.price.toFixed(2)}</p>
              <p className={`text-[10px] mt-1 font-bold ${product.stock < 5 ? 'text-red-500' : 'text-slate-400'}`}>Stock: {product.stock}</p>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-3 opacity-50">
               <RotateCcw className="w-10 h-10 mx-auto text-slate-300" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No products in view. Restore hidden items or adjust search.</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-96 bg-white border border-slate-200 rounded-3xl flex flex-col shadow-xl overflow-hidden print:hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Current Order</h3>
          <button onClick={() => { setCart([]); setLastSaleId(null); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 && !lastSaleId ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-10" />
              <p className="text-sm">Basket is empty</p>
            </div>
          ) : lastSaleId ? (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center animate-in zoom-in-95">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-emerald-900 text-lg">Transaction Settled</h4>
              <p className="text-xs text-emerald-600 mt-1 uppercase font-black">Ref: {lastSaleId}</p>
              
              <div className="mt-8 space-y-3">
                <button 
                  onClick={printInvoice} 
                  className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Invoice PDF</span>
                </button>
                <button 
                  onClick={shareViaWhatsApp}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>
                <button onClick={() => setLastSaleId(null)} className="w-full py-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 pt-4">Start New Session</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 group relative">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">${item.price.toFixed(2)} / unit</p>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="text-right">
                       <p className="font-black text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                       <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-slate-200">x{item.quantity}</span>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!lastSaleId && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <Wallet className="w-3 h-3 mr-1.5" />
                  Select Payment Means
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(method => (
                  <button
                    key={method}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`px-3 py-2.5 rounded-xl text-[10px] font-bold border transition-all truncate ${
                      selectedPaymentMethod === method 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Tax ({taxRate}%)</span>
                <span>${cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black pt-3">
                <span className="text-slate-400">Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95 mt-4">
              <CreditCard className="w-5 h-5" />
              <span>Settle Transaction</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden Invoice Template for Print */}
      <div className="hidden print:block fixed inset-0 bg-white p-12 z-[100]">
        <div className="border-b-4 border-black pb-6 mb-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">{storeName}</h1>
          <p className="text-sm font-bold">Official Store Invoice</p>
        </div>
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Invoice To:</p>
            <p className="text-sm font-black">Walk-in Customer</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-slate-500">Invoice Details:</p>
            <p className="text-sm font-black">#{lastSaleId}</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
            <p className="text-xs font-bold uppercase text-indigo-600 mt-2">Payment: {lastSaleId ? sales.find(s => s.id === lastSaleId)?.paymentMethod : selectedPaymentMethod}</p>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 text-xs font-black uppercase">Item</th>
              <th className="py-2 text-xs font-black uppercase text-center">Qty</th>
              <th className="py-2 text-xs font-black uppercase text-right">Price</th>
              <th className="py-2 text-xs font-black uppercase text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(cart.length > 0 ? cart : sales.find(s => s.id === lastSaleId)?.items || []).map(item => (
              <tr key={item.productId} className="border-b border-slate-100">
                <td className="py-4 text-sm font-bold">{item.name}</td>
                <td className="py-4 text-sm text-center">{item.quantity}</td>
                <td className="py-4 text-sm text-right">${item.price.toFixed(2)}</td>
                <td className="py-4 text-sm font-black text-right">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
               <span>Subtotal</span>
               <span>${(lastSaleId ? sales.find(s => s.id === lastSaleId)?.subtotal : cartSubtotal)?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400">
               <span>Tax</span>
               <span>${(lastSaleId ? sales.find(s => s.id === lastSaleId)?.tax : cartTax)?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-black pt-4">
              <span className="text-lg font-black uppercase">Total Paid</span>
              <span className="text-lg font-black">${(lastSaleId ? sales.find(s => s.id === lastSaleId)?.total : cartTotal)?.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-slate-200 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          This is a computer-generated document by frankisdigital. No signature required.
        </div>
      </div>
    </div>
  );
};

export default POS;
