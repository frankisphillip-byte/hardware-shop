
import React, { useState, useMemo } from 'react';
import { User, UserRole, LogType, PaySlip } from '../types';
import { 
  Search, Plus, UserCircle, DollarSign, Save, X, Shield, 
  Briefcase, FileText, Printer, Edit3, Trash2, CheckCircle2, Clock, Hammer,
  UserPlus, Key, Lock, Eye, EyeOff, LayoutDashboard, ShoppingCart, Package, 
  Calculator, Truck, Users as UsersIcon, Check
} from 'lucide-react';

interface EmployeesProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  role: UserRole;
  addLog: (type: LogType, target: string, details: string, severity?: 'info' | 'warning' | 'success' | 'danger') => void;
}

const Employees: React.FC<EmployeesProps> = ({ users, setUsers, role, addLog }) => {
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
      };
      setUsers(prev => [...prev, newUser]);
      addLog('CREATE', 'EMPLOYEE', `New account for ${newUser.name} created with specific permissions.`, 'success');
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
      permissions: ['pos'] // Default for new users
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
    <div className="space-y-6 relative print:bg-white">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personnel & Payroll</h1>
          <p className="text-slate-500">Manage access control, feature permissions, and compensation.</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button onClick={() => setActiveView('List')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'List' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Directory</button>
            <button onClick={() => setActiveView('Payroll')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'Payroll' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Pay Slips</button>
          </div>
          {activeView === 'List' && (
            <button onClick={handleCreateNewUser} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center space-x-2 transition-all shadow-lg active:scale-95">
              <UserPlus className="w-4 h-4" />
              <span>Initialize User</span>
            </button>
          )}
        </div>
      </div>

      <div className="print:hidden">
        {activeView === 'List' ? (
          <div className="space-y-6">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-96 shadow-sm">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Search staff records..." className="bg-transparent border-none focus:outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group relative">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                        <UserCircle className="w-8 h-8" />
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingUser({ ...user })} className="p-2 bg-slate-50 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 truncate">{user.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{user.role.replace('_', ' ')}</span>
                      <span className="text-[10px] font-bold text-slate-400">@{user.username}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Feature Access</p>
                       <div className="flex flex-wrap gap-1">
                         {availableFeatures.map(feat => (
                           user.permissions.includes(feat.id) && (
                             <div key={feat.id} className="p-1 bg-slate-50 border border-slate-100 rounded-md text-slate-500" title={feat.label}>
                               <feat.icon className="w-3 h-3" />
                             </div>
                           )
                         ))}
                       </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-sm text-slate-900 font-bold border-t border-slate-50 pt-4">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1.5 text-emerald-500" />
                        <span>${user.salary.toLocaleString()}</span>
                      </div>
                      <button onClick={() => setActiveView('Payroll')} className="text-[10px] text-blue-600 hover:underline">Payroll History</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Net Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paySlips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold">{slip.employeeName}</td>
                    <td className="px-6 py-4 text-sm">{slip.period}</td>
                    <td className="px-6 py-4 font-black">${slip.netPay.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${slip.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {slip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-blue-600"><Printer className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{editingUser.id ? 'Modify Access Profile' : 'Initialize New Access'}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase">Configuration for {editingUser.name || 'New Staff'}</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-8 space-y-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Full Employee Name</label>
                    <input type="text" required placeholder="Jane Doe" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">System Login ID</label>
                      <input type="text" required placeholder="username" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all" value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Access Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} required={!editingUser.id} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all" value={editingUser.password} onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Organizational Role</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}>
                        {Object.values(UserRole).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Monthly Base Salary</label>
                      <input type="number" required placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none" value={editingUser.salary} onChange={(e) => setEditingUser({ ...editingUser, salary: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Module Permission Grants</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {availableFeatures.map((feature) => (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() => togglePermission(feature.id)}
                        className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all text-left group ${
                          editingUser.permissions?.includes(feature.id)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                            : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-all ${
                          editingUser.permissions?.includes(feature.id)
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-400 group-hover:text-blue-500'
                        }`}>
                          <feature.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-tight">{feature.label}</p>
                        </div>
                        {editingUser.permissions?.includes(feature.id) && (
                          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 flex space-x-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 text-sm font-black text-slate-400 uppercase tracking-widest">Discard Changes</button>
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all uppercase tracking-widest">
                  {editingUser.id ? 'Authorize Update' : 'Initialize Profile'}
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
