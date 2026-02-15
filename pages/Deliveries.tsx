
import React, { useState, useRef, useEffect } from 'react';
import { Delivery, UserRole, User, Sale, IncomingDelivery, Product, LogType, SaleItem, Branch, StockHistoryEntry } from '../types';
import { 
  MapPin, Package, Truck, Printer, X, Plus, ScanLine, Box, Check, Hammer, MapPinned, Trash2
} from 'lucide-react';

interface DeliveriesProps {
  deliveries: Delivery[];
  setDeliveries: React.Dispatch<React.SetStateAction<Delivery[]>>;
  incomingDeliveries: IncomingDelivery[];
  setIncomingDeliveries: React.Dispatch<React.SetStateAction<IncomingDelivery[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  role: UserRole;
  currentUser: User;
  sales: Sale[];
  addLog: (type: LogType, target: string, details: string, severity?: 'info' | 'warning' | 'success' | 'danger') => void;
  branches: Branch[];
  storeName: string;
}

const Deliveries: React.FC<DeliveriesProps> = ({ 
  deliveries, setDeliveries, incomingDeliveries, setIncomingDeliveries, 
  products, setProducts, role, currentUser, sales, addLog, branches, storeName 
}) => {
  const [activeTab, setActiveTab] = useState<'Outgoing' | 'Incoming' | 'Transfers'>('Outgoing');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [transferItems, setTransferItems] = useState<SaleItem[]>([]);
  const [destination, setDestination] = useState(branches[0]?.name || '');
  const [viewingNote, setViewingNote] = useState<Delivery | null>(null);

  useEffect(() => {
    if (branches.length > 0 && !destination) {
      setDestination(branches[0].name);
    }
  }, [branches]);

  const handleCreateTransfer = () => {
    if (transferItems.length === 0 || !destination) return;
    const newTransfer: Delivery = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      type: 'Transfer',
      origin: 'Main Warehouse',
      destination: destination,
      items: transferItems,
      status: 'Pending',
      driverId: 'u4',
      timeline: [{ status: 'Transfer Authorized', time: new Date().toLocaleString() }]
    };
    setDeliveries(prev => [newTransfer, ...prev]);
    addLog('TRANSFER', newTransfer.id, `Stock transfer initiated to ${destination}.`, 'info');
    setShowTransferModal(false);
    setTransferItems([]);
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === scanInput);
    if (product) {
      setReceiveBatch(prev => {
        const existing = prev.find(i => i.product.id === product.id);
        if (existing) return prev.map(i => i.product.id === product.id ? {...i, qty: i.qty + 1} : i);
        return [...prev, { product, qty: 1, isBox: false }];
      });
      setScanInput('');
    } else {
      alert("Product with this barcode not found in system. Register it in Inventory first.");
    }
  };

  const finalizeReceiving = () => {
    if (receiveBatch.length === 0) return;
    
    setProducts(prev => prev.map(p => {
      const receiveItem = receiveBatch.find(ri => ri.product.id === p.id);
      if (receiveItem) {
        const addedStock = receiveItem.isBox ? (receiveItem.qty * p.boxQuantity) : receiveItem.qty;
        const newStock = p.stock + addedStock;
        
        const historyEntry: StockHistoryEntry = {
          id: `H-${Date.now()}-${p.id}`,
          timestamp: new Date().toISOString(),
          changeAmount: addedStock,
          newStock: newStock,
          reason: 'Receipt',
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

    addLog('INVENTORY_ADJ', 'BULK_RECEIVE', `Received ${receiveBatch.length} product lines via barcode scan.`, 'success');
    setReceiveBatch([]);
    setShowReceiveModal(false);
    alert("Stock levels updated successfully.");
  };

  const addItemToTransfer = (prod: Product) => {
    setTransferItems(prev => {
      const existing = prev.find(i => i.productId === prod.id);
      if (existing) return prev.map(i => i.productId === prod.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, { productId: prod.id, name: prod.name, quantity: 1, price: 0, cost: prod.cost }];
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'Delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    return 'bg-amber-50 text-amber-700 border-amber-100';
  };

  // Barcode Receiving State
  const [scanInput, setScanInput] = useState('');
  const [receiveBatch, setReceiveBatch] = useState<{product: Product, qty: number, isBox: boolean}[]>([]);
  const scanInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Logistics & Shipments</h1>
          <p className="text-slate-500">Coordinate transfers and receive new inventory stock.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('Outgoing')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'Outgoing' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>Orders</button>
          <button onClick={() => setActiveTab('Transfers')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'Transfers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>Transfers</button>
          <button onClick={() => setActiveTab('Incoming')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'Incoming' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>Receipts</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 print:hidden">
        {activeTab === 'Incoming' && (
          <button 
            onClick={() => setShowReceiveModal(true)}
            className="w-full py-8 border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-[2rem] flex flex-col items-center justify-center text-indigo-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all font-black uppercase tracking-widest"
          >
            <ScanLine className="w-10 h-10 mb-3" />
            Launch Scanner: Receive Inventory Stock
          </button>
        )}

        {activeTab === 'Transfers' && (role === UserRole.WAREHOUSE_CLERK || role === UserRole.ADMIN) && (
          <button 
            onClick={() => setShowTransferModal(true)}
            className="w-full py-8 border-2 border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all font-black uppercase tracking-widest"
          >
            <Plus className="w-10 h-10 mb-3" />
            Draft New Inter-Branch Transfer
          </button>
        )}

        {(activeTab === 'Outgoing' || activeTab === 'Transfers') && deliveries.filter(d => activeTab === 'Transfers' ? d.type === 'Transfer' : d.type === 'Customer').map(delivery => (
          <div key={delivery.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center space-x-6">
              <div className={`p-4 rounded-2xl border ${getStatusColor(delivery.status)}`}>
                {delivery.type === 'Transfer' ? <MapPinned className="w-6 h-6" /> : <Package className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-black text-slate-900">{delivery.type} Note #{delivery.id}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mt-1">To: {delivery.destination}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black mt-3 border uppercase tracking-widest ${getStatusColor(delivery.status)}`}>{delivery.status}</span>
              </div>
            </div>
            <button onClick={() => setViewingNote(delivery)} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors">
              <Printer className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Barcode Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                <div className="flex items-center space-x-4">
                   <div className="p-2 bg-white/20 rounded-xl">
                      <ScanLine className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-widest">Inventory Receipt Terminal</h3>
                </div>
                <button onClick={() => setShowReceiveModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
             </div>
             
             <div className="flex-1 flex overflow-hidden">
                {/* Left: Scanner Side */}
                <div className="w-1/2 p-8 border-r border-slate-100 flex flex-col">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Input Scanner Feed</p>
                   <form onSubmit={handleBarcodeScan} className="relative mb-8">
                      <input 
                        ref={scanInputRef}
                        autoFocus
                        type="text" 
                        placeholder="Scan product barcode..." 
                        className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl px-6 py-5 text-lg font-mono font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                      />
                      <ScanLine className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" />
                   </form>
                   
                   <div className="flex-1 bg-slate-50 rounded-[2rem] border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-indigo-500">
                         <Box className="w-10 h-10" />
                      </div>
                      <p className="text-slate-400 text-sm font-medium px-8">Ready to receive bulk shipments. Use the terminal above to capture individual or box barcodes.</p>
                   </div>
                </div>

                {/* Right: Batch Side */}
                <div className="w-1/2 flex flex-col bg-slate-50/30">
                   <div className="p-8 pb-4 flex justify-between items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incoming Batch Queue</p>
                      <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase">{receiveBatch.length} lines</span>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto px-8 space-y-3">
                      {receiveBatch.map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm group">
                           <div className="flex-1 min-w-0 mr-4">
                              <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SKU: {item.product.sku}</p>
                           </div>
                           <div className="flex items-center space-x-3">
                              <div className="flex flex-col items-end">
                                 <input 
                                   type="number" 
                                   className="w-16 border-2 border-slate-100 rounded-xl px-2 py-1 text-center font-black text-indigo-600 text-sm"
                                   value={item.qty}
                                   onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setReceiveBatch(prev => prev.map((it, i) => i === idx ? {...it, qty: val} : it));
                                   }}
                                 />
                                 <button 
                                   onClick={() => {
                                      setReceiveBatch(prev => prev.map((it, i) => i === idx ? {...it, isBox: !it.isBox} : it));
                                   }}
                                   className={`text-[8px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded border transition-all ${item.isBox ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                 >
                                    {item.isBox ? `Box of ${item.product.boxQuantity}` : 'Single Unit'}
                                 </button>
                              </div>
                              <button 
                                onClick={() => setReceiveBatch(prev => prev.filter((_, i) => i !== idx))}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                      ))}
                      {receiveBatch.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2 py-20 opacity-50">
                           <Package className="w-12 h-12" />
                           <p className="font-bold italic">Queue is empty</p>
                        </div>
                      )}
                   </div>

                   <div className="p-8 bg-white border-t border-slate-100">
                      <button 
                        onClick={finalizeReceiving}
                        disabled={receiveBatch.length === 0}
                        className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center space-x-2"
                      >
                         <Check className="w-5 h-5" />
                         <span>Apply to Ledger & Warehouse</span>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Transfer Creation Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <h3 className="text-2xl font-black mb-6">Branch Transfer Manifest</h3>
            <div className="mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Destination Branch</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-8 flex-1 overflow-hidden min-h-[400px]">
              <div className="border border-slate-200 rounded-[2rem] p-6 overflow-y-auto space-y-3 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Stock Directory</p>
                {products.filter(p => p.location === 'Warehouse').map(p => (
                  <button key={p.id} onClick={() => addItemToTransfer(p)} className="w-full text-left p-4 bg-white hover:bg-blue-50 rounded-2xl border border-slate-100 flex justify-between items-center transition-all group hover:border-blue-200">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-1">Avail: {p.stock}</p>
                    </div>
                    <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Manifest Contents</p>
                <div className="flex-1 border border-slate-200 rounded-[2rem] p-6 overflow-y-auto mb-6 space-y-3">
                  {transferItems.map(item => (
                    <div key={item.productId} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold truncate pr-4">{item.name}</span>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="number"
                          className="w-12 bg-white border border-slate-200 rounded-lg text-center font-black text-[10px]"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setTransferItems(prev => prev.map(i => i.productId === item.productId ? {...i, quantity: val} : i));
                          }}
                        />
                        <button onClick={() => setTransferItems(prev => prev.filter(i => i.productId !== item.productId))}><Trash2 className="w-3 h-3 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                  {transferItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2 py-10 opacity-50">
                       <MapPin className="w-10 h-10" />
                       <p className="italic text-xs font-bold">Manifest is empty</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3 pt-2">
                  <button onClick={() => setShowTransferModal(false)} className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Cancel</button>
                  <button onClick={handleCreateTransfer} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Publish Transfer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Delivery/Transfer Note Modal */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded shadow-2xl relative my-8 p-12 animate-in zoom-in-95 print:p-0 print:my-0 print:shadow-none">
            <div className="absolute top-4 right-4 flex space-x-2 print:hidden">
              <button onClick={() => window.print()} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"><Printer className="w-5 h-5" /></button>
              <button onClick={() => setViewingNote(null)} className="p-3 bg-white text-slate-400 rounded-full border border-slate-200 hover:bg-slate-50"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-8">
              <div>
                <Hammer className="w-12 h-12 mb-4" />
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{storeName}</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Logistics & Supply Intelligence</p>
              </div>
              <div className="text-right">
                <h2 className="text-5xl font-black uppercase text-slate-900 tracking-tighter leading-none">{viewingNote.type}</h2>
                <p className="text-lg font-black mt-4">REF: {viewingNote.id}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2">{viewingNote.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Origin Depot</p>
                <p className="text-sm font-black">{viewingNote.origin}</p>
                <p className="text-[10px] text-slate-500 mt-2 italic font-medium leading-relaxed">Certified Enterprise Logistics Hub #0042-Main</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Delivery Destination</p>
                <p className="text-sm font-black">{viewingNote.destination}</p>
                <p className="text-[10px] text-slate-500 mt-2 italic font-medium leading-relaxed">External Supply Point Verified</p>
              </div>
            </div>

            <table className="w-full text-left mb-12">
              <thead className="border-b-2 border-black">
                <tr>
                  <th className="py-3 text-[10px] font-black uppercase tracking-widest">Item Manifest</th>
                  <th className="py-3 text-[10px] font-black uppercase tracking-widest text-right">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewingNote.items.map(item => (
                  <tr key={item.productId}>
                    <td className="py-5 text-sm font-bold text-slate-900">{item.name}</td>
                    <td className="py-5 text-sm font-black text-right">{item.quantity} UNITS</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-slate-900 text-slate-400 p-8 rounded-3xl text-[10px] font-medium leading-relaxed mb-12 border-l-8 border-blue-600">
              <p className="font-black uppercase text-white mb-2 tracking-widest text-xs">Logistic Terms & Conditions</p>
              Please check all items upon arrival. Any discrepancies must be reported to the Main Warehouse within 24 hours of dispatch. This document serves as a legal record of stock movement within the Enterprise Resource Planning system.
            </div>

            <div className="grid grid-cols-2 gap-20 pt-12 border-t border-slate-100">
              <div className="text-center">
                <div className="h-0.5 bg-black w-full mb-3"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Authorized Dispatcher</p>
                <p className="text-[9px] text-slate-500 mt-2 font-bold italic">({currentUser.name})</p>
              </div>
              <div className="text-center">
                <div className="h-0.5 bg-black w-full mb-3"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Receiving Official</p>
                <p className="text-[9px] text-slate-500 mt-2 font-bold italic">(Authorized Signature & Stamp)</p>
              </div>
            </div>

            <div className="mt-8 text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">
              Powered by frankisdigital
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
