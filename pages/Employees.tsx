
import React, { useState, useMemo } from 'react';
import { User, UserRole, LogType, PaySlip, Branch } from '../types';
import { 
  Search, Plus, UserCircle, DollarSign, Save, X, Shield, 
  Briefcase, FileText, Printer, Edit3, Trash2, CheckCircle2, Clock, Hammer,
  UserPlus, Key, Lock, Eye, EyeOff, LayoutDashboard, ShoppingCart, Package, 
  Calculator, Truck, Users as UsersIcon, Check, MapPin, ChevronRight, Phone, Mail
} from 'lucide-react';

interface EmployeesProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  role: UserRole;
  addLog: (type: LogType, target: string, details: string, severity?: 'info' | 'warning' | 'success' | 'danger') => void;
  branches?: Branch[];
}

const Employees: React.FC<EmployeesProps> = ({ users, setUsers, role, addLog, branches = [] }) => {
  const [activeView, setActiveView] = useState<'List' | 'Payroll'>('List');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [paySlips, setPaySlips] = useState<PaySlip[]>([
    {
      id: 'PS-1001',
      employeeId: 'u2',
      employeeName: 'Sara Cashier',
      period: 'May 2024',
      baseSalary: 2500,
      bonus: 200,
      deductions: 50,
      netPay: 2650,
      status: 'Paid',
      generatedAt: '2024-05-01'
    }
  ]);

  const canEdit = role === UserRole.ADMIN || role === UserRole.HR;

  const availableFeatures = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Terminal', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'accounting', label: 'Accounting', icon: Calculator },
    { id: 'employees', label: 'Employees/HR', icon: UsersIcon },
    { id: 'deliveries', label: 'Logistics', icon: Truck },
  ];

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
        <UserCircle className="w-16 h-16 opacity-10" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p>Only Administrators or Human Resources can manage personnel and credentials.</p>
      </div>
    );
  }

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editingUser.id) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? (editingUser as User) : u));
      addLog('UPDATE', 'EMPLOYEE', `Account and permissions updated for ${editingUser.name}.`, 'info');
    } else {
      const newUser: User = {
        ...editingUser as User,
        id: `u${Date.now()}`,
        branchId: editingUser.branchId || branches[0]?.id || 'b1'
      };
      setUsers(prev => [...prev, newUser]);
      addLog('CREATE', 'EMPLOYEE', `New account for ${newUser.name} created at branch ${newUser.branchId}.`, 'success');
    }
    setEditingUser(null);
  };

  const handleCreateNewUser = () => {
    setEditingUser({ 
      name: '', 
      username: '', 
      password: '', 
      role: UserRole.CASHIER, 
      salary: 0,
      branchId: branches[0]?.id || '',
      permissions: ['pos'] 
    });
    setShowPassword(false);
  };

  const togglePermission = (featureId: string) => {
    if (!editingUser) return;
    const currentPerms = editingUser.permissions || [];
    const newPerms = currentPerms.includes(featureId)
      ? currentPerms.filter(p => p !== featureId)
      : [...currentPerms, featureId];
    setEditingUser({ ...editingUser, permissions: newPerms });
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    if (user.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length === 1) {
      alert("System Safety Lock: Cannot delete the final administrator account.");
      return;
    }
    if (confirm(`Are you sure you want to terminate ${user.name}'s system access?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      addLog('DELETE', 'EMPLOYEE', `Account for ${user.name} was removed.`, 'danger');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personnel Network</h1>
          <p className="text-slate-500 font-medium">Manage multi-branch staff, credentials and organizational growth.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => setActiveView('List')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'List' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'}`}>Directory</button>
          <button onClick={() => setActiveView('Payroll')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'Payroll' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'}`}>Pay Slips</button>
        </div>
      </div>

      {activeView === 'List' && (
        <div className="space-y-8">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex flex-1 items-center bg-white border border-slate-200 rounded-[2rem] px-6 py-4 shadow-sm focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-4" />
              <input type="text" placeholder="Search staff records..." className="bg-transparent border-none focus:outline-none text-sm w-full font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={handleCreateNewUser} className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-[1.5rem] flex items-center justify-center space-x-3 transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group">
              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-black text-sm uppercase tracking-widest">Add New Employee</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredUsers.map((user) => {
              const userBranch = branches.find(b => b.id === user.branchId);
              return (
              <div key={user.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all group relative p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${user.role === UserRole.ADMIN ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white'}`}>
                    <UserCircle className="w-10 h-10" />
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingUser({ ...user })} className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl border border-slate-100"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-3 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 truncate tracking-tight mb-1">{user.name}</h3>
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{user.role.replace('_', ' ')}</span>
                  <span className="text-[9px] font-bold text-slate-400">@{user.username}</span>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Branch Station</span>
                      <div className="flex items-center text-xs font-bold text-slate-900">
                        <MapPin className="w-3 h-3 mr-1.5 text-blue-500" />
                        {userBranch?.name || 'Main Office'}
                      </div>
                    </div>
                    {userBranch && (
                      <div className="flex flex-col space-y-1 items-end">
                         <span className="flex items-center text-[9px] font-bold text-slate-400">
                           <Phone className="w-2.5 h-2.5 mr-1" />
                           {userBranch.phone}
                         </span>
                         <span className="flex items-center text-[9px] font-bold text-slate-400">
                           <Mail className="w-2.5 h-2.5 mr-1" />
                           {userBranch.email}
                         </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Salary</span>
                    <div className="flex items-center text-xs font-black text-emerald-600">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {user.salary.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Feature Permissions</p>
                   <div className="flex flex-wrap gap-1.5">
                     {availableFeatures.map(feat => (
                       user.permissions.includes(feat.id) && (
                         <div key={feat.id} className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 group-hover:text-blue-500 transition-colors" title={feat.label}>
                           <feat.icon className="w-3.5 h-3.5" />
                         </div>
                       )
                     ))}
                   </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {activeView === 'Payroll' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Universal Payroll Register</h3>
             <Calculator className="w-5 h-5 text-slate-400" />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Personnel</th>
                <th className="px-8 py-5">Accounting Period</th>
                <th className="px-8 py-5">Net Remuneration</th>
                <th className="px-8 py-5">Settlement Status</th>
                <th className="px-8 py-5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paySlips.map((slip) => (
                <tr key={slip.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black mr-4 text-xs">
                        {slip.employeeName.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{slip.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">{slip.period}</td>
                  <td className="px-8 py-5 font-black text-slate-900">${slip.netPay.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${slip.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {slip.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-none hover:shadow-md">
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Initialize User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600 border border-slate-100">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">{editingUser.id ? 'Modify System Access' : 'Onboard New Personnel'}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure credentials and branch assignment</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-10 space-y-10 overflow-y-auto flex-1 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Legal Name</label>
                    <input type="text" required placeholder="e.g. Johnathan Smith" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Branch Assignment</label>
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                        <select required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:outline-none appearance-none" value={editingUser.branchId} onChange={(e) => setEditingUser({ ...editingUser, branchId: e.target.value })}>
                          <option value="">Select Station...</option>
                          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Login Identity</label>
                      <input type="text" required placeholder="jsmith" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none" value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">System Access Key</label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={showPassword ? 'text' : 'password'} required={!editingUser.id} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm font-bold focus:outline-none" value={editingUser.password} onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5">Monthly Pay ($)</label>
                      <div className="relative">
                         <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                         <input type="number" required placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm font-black focus:outline-none" value={editingUser.salary} onChange={(e) => setEditingUser({ ...editingUser, salary: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Module Authorization Grants</h4>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">{editingUser.permissions?.length} Modules</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {availableFeatures.map((feature) => (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() => togglePermission(feature.id)}
                        className={`flex items-center space-x-4 p-4 rounded-2xl border transition-all text-left group ${
                          editingUser.permissions?.includes(feature.id)
                            ? 'bg-white text-slate-900 border-blue-500 shadow-xl shadow-blue-500/5'
                            : 'bg-white/40 text-slate-400 border-slate-100 hover:border-blue-200'
                        }`}
                      >
                        <div className={`p-3 rounded-xl transition-all ${
                          editingUser.permissions?.includes(feature.id)
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-slate-100 text-slate-300 group-hover:text-blue-500'
                        }`}>
                          <feature.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1.5">{feature.label}</p>
                          <p className="text-[9px] font-medium opacity-60">Authorize access to {feature.label.toLowerCase()} sub-systems.</p>
                        </div>
                        {editingUser.permissions?.includes(feature.id) && (
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-10 flex space-x-6">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors">Abort Onboarding</button>
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-2xl shadow-slate-900/20 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center space-x-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{editingUser.id ? 'Authorize Updates' : 'Commit To Personnel Registry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
