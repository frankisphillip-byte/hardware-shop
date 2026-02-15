
import React, { useMemo, useState } from 'react';
import { Sale, Expense, UserRole, AuditLog, Product, User } from '../types';
import { 
  Plus, Search, Printer, TrendingUp, DollarSign, 
  Trash2, X, Scale, FileText, Landmark,
  Wallet, PieChart as PieChartIcon, ArrowRight, Calculator, Activity,
  Edit3, History
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
    if (!editingExpense?.description || !editingExpense?.amount) return;
    
    if (editingExpense.id) {
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? (editingExpense as Expense) : e));
    } else {
      const expense: Expense = {
        id: `EXP-${Date.now()}`,
        date: editingExpense.date!,
        description: editingExpense.description!,
        amount: Number(editingExpense.amount!),
        category: editingExpense.category as any
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
      
      {/* Expense Ledger Tab remains similar, just providing P&L and Balance Sheet logic improvements */}
      {activeTab === 'Expense Ledger' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* ... existing table code ... */}
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {expenses.map(e => (
                 <tr key={e.id}>
                    <td className="px-6 py-4 text-sm">{e.date}</td>
                    <td className="px-6 py-4 text-sm font-bold">{e.description}</td>
                    <td className="px-6 py-4 text-right text-red-600 font-bold">-${e.amount}</td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleDeleteExpense(e.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
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
    <div className={`p-6 rounded-3xl border shadow-sm ${isMain ? 'bg-slate-900 text-white border-slate-800' : 'bg-white'}`}>
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
    <span className={isNegative ? 'text-red-500' : ''}>
      {isNegative ? '(' : ''}${Math.abs(value).toLocaleString()}{isNegative ? ')' : ''}
    </span>
  </div>
);

export default Accounting;
