
import React, { useState } from 'react';
import { UserRole, SystemConfig, LogType, Branch } from '../types';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Bell, 
  Sparkles, 
  Save, 
  RefreshCcw, 
  Users, 
  ShoppingBag, 
  ArrowRight,
  Info,
  ChevronRight,
  DollarSign,
  MapPin,
  Trash2,
  Plus,
  Edit2,
  Check,
  X,
  Store,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SettingsProps {
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  role: UserRole;
  addLog: (type: LogType, target: string, details: string, severity?: 'info' | 'warning' | 'success' | 'danger') => void;
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
}

const Settings: React.FC<SettingsProps> = ({ config, setConfig, role, addLog, branches, setBranches }) => {
  const [form, setForm] = useState<SystemConfig>({ ...config });
  const [activeSection, setActiveSection] = useState<'General' | 'Security' | 'AI' | 'Maintenance' | 'Branches'>('General');
  const [newBranchName, setNewBranchName] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  
  // Branch Editing State
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editBranchName, setEditBranchName] = useState('');

  if (role !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
        <Shield className="w-16 h-16 opacity-10" />
        <h2 className="text-xl font-bold">Admin Only</h2>
        <p>You do not have permission to modify system configuration.</p>
      </div>
    );
  }

  const handleSave = () => {
    setConfig(form);
    addLog('SYSTEM', 'Config', 'System settings updated by administrator.', 'success');
    alert("Settings saved successfully!");
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const newBranch = { id: `b${Date.now()}`, name: newBranchName.trim() };
    setBranches(prev => [...prev, newBranch]);
    addLog('BRANCH', newBranch.id, `New branch "${newBranch.name}" created.`, 'success');
    setNewBranchName('');
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentMethod.trim()) return;
    if (form.paymentMethods.includes(newPaymentMethod.trim())) {
      alert("Payment method already exists.");
      return;
    }
    setForm(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, newPaymentMethod.trim()]
    }));
    setNewPaymentMethod('');
  };

  const removePaymentMethod = (method: string) => {
    setForm(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(m => m !== method)
    }));
  };

  const handleDeleteBranch = (id: string) => {
    const branch = branches.find(b => b.id === id);
    if (!branch) return;
    if (confirm(`Confirm deletion of "${branch.name}"? This will affect future transfers.`)) {
      setBranches(prev => prev.filter(b => b.id !== id));
      addLog('BRANCH', id, `Branch "${branch.name}" removed from system.`, 'danger');
    }
  };

  const handleStartEditBranch = (branch: Branch) => {
    setEditingBranchId(branch.id);
    setEditBranchName(branch.name);
  };

  const handleUpdateBranch = (id: string) => {
    if (!editBranchName.trim()) return;
    setBranches(prev => prev.map(b => b.id === id ? { ...b, name: editBranchName.trim() } : b));
    addLog('BRANCH', id, `Branch renamed to "${editBranchName.trim()}".`, 'info');
    setEditingBranchId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control Center</h1>
          <p className="text-slate-500">Global system configuration and administration.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span className="font-bold">Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-1">
          <NavButton 
            active={activeSection === 'General'} 
            onClick={() => setActiveSection('General')} 
            icon={SettingsIcon} 
            label="Store Branding" 
          />
          <NavButton 
            active={activeSection === 'Branches'} 
            onClick={() => setActiveSection('Branches')} 
            icon={MapPin} 
            label="Branch Locations" 
          />
          <NavButton 
            active={activeSection === 'Security'} 
            onClick={() => setActiveSection('Security')} 
            icon={Shield} 
            label="Security & Access" 
          />
          <NavButton 
            active={activeSection === 'AI'} 
            onClick={() => setActiveSection('AI')} 
            icon={Sparkles} 
            label="AI Intelligence" 
          />
          <NavButton 
            active={activeSection === 'Maintenance'} 
            onClick={() => setActiveSection('Maintenance')} 
            icon={Database} 
            label="Maintenance" 
          />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-8">
              {activeSection === 'General' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Store className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Local Business Identity</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mb-6">These details will appear on customer invoices, delivery notes, and digital receipts.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Hardware Store Name" tooltip="This is the name your customers will see on receipts.">
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="e.g. Acme Hardware & Tools"
                          value={form.storeName}
                          onChange={(e) => setForm({...form, storeName: e.target.value})}
                        />
                      </FormField>
                      <FormField label="Local Currency">
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={form.currency}
                          onChange={(e) => setForm({...form, currency: e.target.value})}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </FormField>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                      Payment Settings
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mb-4">Define which payment methods are available at the POS terminal.</p>
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {form.paymentMethods.map(method => (
                          <div key={method} className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100 font-bold text-xs group">
                            <span>{method}</span>
                            <button 
                              onClick={() => removePaymentMethod(method)}
                              className="text-indigo-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <form onSubmit={handleAddPaymentMethod} className="flex space-x-2">
                        <input 
                          type="text"
                          placeholder="Add payment method (e.g. Ecocash, Cash, Swipe)"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={newPaymentMethod}
                          onChange={(e) => setNewPaymentMethod(e.target.value)}
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all">
                          Add Method
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <RefreshCcw className="w-5 h-5 mr-2 text-emerald-600" />
                      Invoicing Logic
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Low Stock Threshold (Units)" tooltip="Items below this number will trigger alerts.">
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={form.lowStockThreshold}
                          onChange={(e) => setForm({...form, lowStockThreshold: parseInt(e.target.value) || 0})}
                        />
                      </FormField>
                      <FormField label="Tax Rate (%)">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                          <input 
                            type="number" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={form.taxRate}
                            onChange={(e) => setForm({...form, taxRate: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </FormField>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center space-x-2 mb-2">
                       <Shield className="w-4 h-4 text-blue-500" />
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">SaaS Provider info</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">This software is powered by the **frankisdigital** platform. Infrastructure and security updates are managed by the provider.</p>
                  </div>
                </div>
              )}

              {activeSection === 'Branches' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Branch Locations</h3>
                    <p className="text-xs text-slate-400 font-medium">Create and manage your organization's physical branches and warehouses.</p>
                  </div>

                  <form onSubmit={handleAddBranch} className="flex space-x-3">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        required
                        placeholder="New Branch Name..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center space-x-2 active:scale-95 transition-all">
                      <Plus className="w-4 h-4" />
                      <span>Create Branch</span>
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {branches.map(branch => (
                      <div key={branch.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
                            <MapPin className="w-5 h-5" />
                          </div>
                          {editingBranchId === branch.id ? (
                            <div className="flex-1 flex items-center space-x-2 animate-in slide-in-from-left-2">
                              <input 
                                autoFocus
                                className="flex-1 bg-white border-2 border-blue-500 rounded-lg px-3 py-1 text-sm font-bold focus:outline-none"
                                value={editBranchName}
                                onChange={(e) => setEditBranchName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleUpdateBranch(branch.id);
                                  if (e.key === 'Escape') setEditingBranchId(null);
                                }}
                              />
                              <button onClick={() => handleUpdateBranch(branch.id)} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditingBranchId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-slate-900 truncate">{branch.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: {branch.id}</p>
                            </div>
                          )}
                        </div>
                        
                        {editingBranchId !== branch.id && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all ml-4">
                            <button 
                              onClick={() => handleStartEditBranch(branch)}
                              className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Branch Name"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Branch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'Security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-start justify-between bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex space-x-4">
                      <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900">User Profile Management</h4>
                        <p className="text-sm text-blue-800/70 mt-1">Add, edit, or remove staff accounts and assign security roles.</p>
                      </div>
                    </div>
                    <Link 
                      to="/employees" 
                      className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center"
                    >
                      Manage Profiles <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              )}

              {activeSection === 'AI' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Gemini Intelligence</h3>
                      <p className="text-slate-500 text-sm mt-1">Leverage advanced LLM reasoning for business insights.</p>
                    </div>
                    <button 
                      onClick={() => setForm({...form, aiEnabled: !form.aiEnabled})}
                      className={`w-14 h-7 rounded-full transition-all relative ${form.aiEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${form.aiEnabled ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'Maintenance' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">System Utilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="p-4 border border-slate-200 rounded-2xl text-left hover:bg-slate-50 transition-all flex items-center group">
                        <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-all mr-3">
                          <RefreshCcw className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Flush Session Logs</p>
                          <p className="text-[10px] text-slate-400">Clear old activity data from the database.</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold text-sm ${
      active 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'text-slate-500 hover:bg-white hover:shadow-sm'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const FormField = ({ label, children, tooltip }: any) => (
  <div className="space-y-1.5">
    <div className="flex items-center">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      {tooltip && <Info className="w-3 h-3 ml-2 text-slate-300 cursor-help" title={tooltip} />}
    </div>
    {children}
  </div>
);

export default Settings;
