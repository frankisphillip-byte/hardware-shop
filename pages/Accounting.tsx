
import React, { useMemo, useState } from 'react';
import { Sale, Expense, UserRole, AuditLog, Product, User } from '../types';
import { 
  Plus, Search, Printer, TrendingUp, DollarSign, 
  Trash2, X, Scale, FileText, Landmark,
  Wallet, PieChart as PieChartIcon, ArrowRight, Calculator, Activity,
  Edit3, History, Check, Calendar, Tag
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants';

interface AccountingProps {
  sales: Sale[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  role: UserRole;
  logs: AuditLog[];
  products: Product[];
  users: User[];
  taxRate?: number;
}

const Accounting: React.FC<AccountingProps> = ({ 
  sales, expenses, setExpenses, role, logs, products, users, taxRate = 15 
}) => {
  const [activeTab, setActiveTab] = useState<'P&L' | 'Balance Sheet' | 'Cash Flow' | 'Expense Ledger' | 'Audit'>('P&L');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Partial<Expense> | null>(null);

  const finData = useMemo(() => {
    // Basic Income Statement (Net Revenue)
    const netRevenue = sales.reduce((acc, s) => acc + (s.subtotal || s.total / (1 + (taxRate / 100))), 0);
    const taxCollected = sales.reduce((acc, s) => acc + (s.tax || (s.total - (s.total / (1 + (taxRate / 100))))), 0);
    
    const cogs = sales.reduce((acc, s) => acc + s.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0), 0);
    const grossProfit = netRevenue - cogs;
    
    // Operating Expenses
    const generalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const payrollExpenses = users.reduce((acc, u) => acc + u.salary, 0);
    const totalOperatingExpenses = generalExpenses + payrollExpenses;
    
    const ebitda = grossProfit - totalOperatingExpenses;
    const estIncomeTax = ebitda > 0 ? (ebitda * (taxRate / 100)) : 0;
    const netIncome = ebitda - estIncomeTax;

    // Balance Sheet
    const inventoryAssetValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const cashInBank = sales.reduce((acc, s) => acc + s.total, 0) - generalExpenses - payrollExpenses; 
    const totalAssets = cashInBank + inventoryAssetValue;
    
    // Liabilities
    const salariesPayable = payrollExpenses * 0.25; 
    const totalLiabilities = salariesPayable + taxCollected + estIncomeTax;
    
    const equity = totalAssets - totalLiabilities;

    return { 
      netRevenue, taxCollected, cogs, grossProfit, totalOperatingExpenses, generalExpenses, payrollExpenses, ebitda, estIncomeTax, netIncome,
      inventoryAssetValue, cashInBank, totalAssets, salariesPayable, totalLiabilities, equity,
      grossMargin: netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0,
      netMargin: netRevenue > 0 ? (netIncome / netRevenue) * 100 : 0
    };
  }, [sales, expenses, products, users, taxRate]);

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense({ ...expense });
    } else {
      setEditingExpense({
        category: 'Other',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense?.description || editingExpense?.amount === undefined) return;
    
    if (editingExpense.id) {
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? (editingExpense as Expense) : e));
    } else {
      const expense: Expense = {
        id: `EXP-${Date.now()}`,
        date: editingExpense.date || new Date().toISOString().split('T')[0],
        description: editingExpense.description!,
        amount: Number(editingExpense.amount!),
        category: (editingExpense.category as any) || 'Other'
      };
      setExpenses(prev => [expense, ...prev]);
    }

    setShowModal(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm("Are you sure you want to remove this ledger entry?")) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  if (role !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
        <Landmark className="w-16 h-16 opacity-10" />
        <h2 className="text-xl font-bold">Admin Only</h2>
        <p>Full financial accounting records are restricted to system administrators.</p>
      </div>
    );
  }

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enterprise Accounting</h1>
          <p className="text-slate-500">Professional ledger and profit analysis.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => window.print()} className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm">
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg active:scale-95">
            <Plus className="w-4 h-4" />
            <span>Post Ledger Entry</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 print:hidden overflow-x-auto scrollbar-hide">
        {['P&L', 'Balance Sheet', 'Cash Flow', 'Expense Ledger', 'Audit'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'P&L' ? 'Income Statement' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'P&L' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FinCard title="Net Revenue" value={finData.netRevenue} icon={DollarSign} color="blue" />
            <FinCard title="Gross Margin" value={finData.grossMargin.toFixed(1) + '%'} icon={Activity} color="indigo" />
            <FinCard title="Tax Liability" value={finData.taxCollected + finData.estIncomeTax} icon={Calculator} color="amber" />
            <FinCard title="Net Income" value={finData.netIncome} icon={TrendingUp} color="emerald" isMain />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center">
              <FileText className="w-5 h-5 mr-3 text-blue-600" />
              Detailed Income Statement
            </h3>
            <div className="space-y-5">
              <FinLine label="Net Sales Revenue (Excl. Tax)" value={finData.netRevenue} />
              <FinLine label="Cost of Goods Sold (COGS)" value={finData.cogs} isNegative />
              <div className="pt-2 border-t border-slate-100">
                <FinLine label="Gross Profit" value={finData.grossProfit} isBold />
              </div>
              <div className="py-4 bg-slate-50/50 rounded-2xl px-6 space-y-3">
                <FinLine label="Payroll & Salaries" value={finData.payrollExpenses} isNegative />
                <FinLine label="General Operating Expenses" value={finData.generalExpenses} isNegative />
              </div>
              <FinLine label="EBITDA" value={finData.ebitda} isBold />
              <FinLine label={`Est. Corporate Income Tax (${taxRate}%)`} value={finData.estIncomeTax} isNegative />
              
              <div className="border-t-2 border-slate-900 pt-6 mt-4">
                <div className={`flex justify-between items-center p-6 rounded-2xl ${finData.netIncome >= 0 ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900'}`}>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">Total Net Profit</span>
                    <span className="text-[10px] font-bold uppercase opacity-60">Net Margin: {finData.netMargin.toFixed(2)}%</span>
                  </div>
                  <span className={`text-3xl font-black ${finData.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${finData.netIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Balance Sheet' && (
        <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-blue-600">
              <Wallet className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Current Assets</h3>
            </div>
            <div className="space-y-4">
              <FinLine label="Cash on Hand (Gross Sales)" value={finData.cashInBank} />
              <FinLine label="Inventory Asset Value (At Cost)" value={finData.inventoryAssetValue} />
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900 uppercase text-xs tracking-widest">Total Assets</span>
                <span className="text-xl font-black text-blue-600">${finData.totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-red-500">
              <Scale className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Liabilities & Equity</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <FinLine label="Sales Tax Payable (GST/VAT)" value={finData.taxCollected} isNegative />
                <FinLine label="Unpaid Income Tax Provision" value={finData.estIncomeTax} isNegative />
                <FinLine label="Accrued Salaries Payable" value={finData.salariesPayable} isNegative />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <FinLine label="Retained Earnings / Equity" value={finData.equity} isBold />
              </div>
              <div className="pt-6 border-t border-slate-900/10 flex justify-between items-center">
                <span className="font-bold text-slate-900 uppercase text-xs tracking-widest">Balanced Total</span>
                <span className="text-xl font-black text-slate-900">${(finData.totalLiabilities + finData.equity).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'Expense Ledger' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-96 shadow-sm">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search ledger entries..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{e.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{e.description}</td>
                    <td className="px-6 py-4 text-right text-rose-600 font-black">
                      -${e.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleOpenModal(e)} 
                          className="p-2 bg-white text-slate-400 hover:text-blue-600 border border-slate-100 rounded-xl hover:border-blue-200 shadow-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(e.id)} 
                          className="p-2 bg-white text-slate-400 hover:text-rose-600 border border-slate-100 rounded-xl hover:border-rose-200 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No ledger entries found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs View */}
      {activeTab === 'Audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">System Operation History</h3>
             <History className="w-4 h-4 text-slate-400" />
          </div>
          <div className="max-h-[600px] overflow-y-auto">
             {logs.length > 0 ? (
               <div className="divide-y divide-slate-50">
                  {logs.map(log => (
                    <div key={log.id} className="p-6 flex items-start space-x-4 hover:bg-slate-50 transition-colors">
                       <div className={`p-2 rounded-xl shrink-0 ${
                         log.severity === 'success' ? 'bg-emerald-50 text-emerald-600' :
                         log.severity === 'danger' ? 'bg-rose-50 text-rose-600' :
                         log.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                       }`}>
                          <Activity className="w-4 h-4" />
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between">
                             <p className="text-sm font-bold text-slate-900">{log.details}</p>
                             <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                            User: {log.userName} • Target: {log.target} • Type: {log.type}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="py-20 text-center">
                  <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No audit logs available</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showModal && editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8 flex items-center">
              <Landmark className="w-6 h-6 mr-3 text-blue-600" />
              {editingExpense.id ? 'Edit Ledger Entry' : 'Post Ledger Entry'}
            </h3>
            <form onSubmit={handleSaveExpense} className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Description / Payee</label>
                  <input 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none" 
                    value={editingExpense.description} 
                    onChange={e => setEditingExpense({...editingExpense, description: e.target.value})} 
                    placeholder="e.g. Utility Bill, Rent payment..."
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                      <Calendar className="w-3 h-3 mr-1.5 text-blue-500" />
                      Transaction Date
                    </label>
                    <input 
                      type="date" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none" 
                      value={editingExpense.date} 
                      onChange={e => setEditingExpense({...editingExpense, date: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                      <Tag className="w-3 h-3 mr-1.5 text-indigo-500" />
                      Category
                    </label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold" 
                      value={editingExpense.category} 
                      onChange={e => setEditingExpense({...editingExpense, category: e.target.value as any})}
                    >
                      {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
                    <DollarSign className="w-3 h-3 mr-1.5 text-rose-500" />
                    Transaction Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                    <input 
                      type="number" 
                      required 
                      step="0.01"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-3.5 text-sm font-black focus:ring-2 focus:ring-rose-500/20 outline-none" 
                      value={editingExpense.amount} 
                      onChange={e => setEditingExpense({...editingExpense, amount: parseFloat(e.target.value) || 0})} 
                    />
                  </div>
               </div>

               <div className="pt-6 flex space-x-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center">
                    <Check className="w-4 h-4 mr-2" />
                    <span>{editingExpense.id ? 'Authorize Update' : 'Commit Entry'}</span>
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FinCard = ({ title, value, icon: Icon, color, isMain }: any) => {
  const colorMap: any = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100'
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-sm transition-transform hover:-translate-y-1 ${isMain ? 'bg-slate-900 text-white border-slate-800' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${isMain ? 'bg-white/10 text-white' : colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isMain ? 'text-slate-400' : 'text-slate-400'}`}>{title}</h3>
      <p className={`text-2xl font-black mt-1 ${isMain ? 'text-white' : 'text-slate-900'}`}>
        {typeof value === 'number' ? '$' + value.toLocaleString() : value}
      </p>
    </div>
  );
};

const FinLine = ({ label, value, isNegative, isBold }: any) => (
  <div className={`flex justify-between items-center text-sm ${isBold ? 'font-bold text-slate-900' : 'text-slate-600 font-medium'}`}>
    <span>{label}</span>
    <span className={isNegative ? 'text-rose-500' : ''}>
      {isNegative ? '(' : ''}${Math.abs(value).toLocaleString()}{isNegative ? ')' : ''}
    </span>
  </div>
);

export default Accounting;
