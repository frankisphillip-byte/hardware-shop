
import React, { useState, useEffect } from 'react';
import { User, LogType, UserRole } from '../types';
import { 
  UserCircle, Mail, Shield, Save, Key, Lock, Briefcase, 
  DollarSign, CheckCircle2, AlertCircle, Eye, EyeOff, Users, ChevronDown,
  LayoutDashboard, ShoppingCart, Package, Calculator, Truck, Users as UsersIcon, Check
} from 'lucide-react';

interface ProfileProps {
  user: User;
  allUsers: User[];
  updateUser: (user: User) => void;
  addLog: (type: LogType, target: string, details: string, severity?: 'info' | 'warning' | 'success' | 'danger') => void;
}

const Profile: React.FC<ProfileProps> = ({ user, allUsers, updateUser, addLog }) => {
  const [selectedUser, setSelectedUser] = useState<User>(user);
  const [formData, setFormData] = useState<User>({ ...user });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user.role === UserRole.ADMIN;

  const availableFeatures = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Terminal', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'accounting', label: 'Accounting', icon: Calculator },
    { id: 'employees', label: 'Employees/HR', icon: UsersIcon },
    { id: 'deliveries', label: 'Logistics', icon: Truck },
  ];

  useEffect(() => {
    setFormData({ ...selectedUser });
    setNewPassword('');
    setIsSaved(false);
    setError('');
  }, [selectedUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const updatedUser = { ...formData };
    
    if (newPassword) {
      if (newPassword.length < 8) {
        setError('For security, the password must be at least 8 characters long.');
        return;
      }
      updatedUser.password = newPassword;
      addLog('PROFILE', updatedUser.id, `Password changed for ${updatedUser.name} by ${user.name}`, 'warning');
    }

    updateUser(updatedUser);
    addLog('PROFILE', updatedUser.id, `Profile details and permissions for ${updatedUser.name} modified by ${user.name}`, 'success');
    setIsSaved(true);
    setNewPassword('');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUserChange = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) setSelectedUser(found);
  };

  const togglePermission = (featureId: string) => {
    if (!isAdmin) return;
    const currentPerms = formData.permissions || [];
    const newPerms = currentPerms.includes(featureId)
      ? currentPerms.filter(p => p !== featureId)
      : [...currentPerms, featureId];
    setFormData({ ...formData, permissions: newPerms });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Identity & Access</h1>
          <p className="text-slate-500">
            {isAdmin 
              ? "Administrative Control: Override and manage any system profile." 
              : "Manage your personal credentials and view your employment status."}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            <Users className="w-4 h-4 text-slate-400 ml-2" />
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Override:</span>
            <select 
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={selectedUser.id}
              onChange={(e) => handleUserChange(e.target.value)}
            >
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-center p-8 relative">
            {isAdmin && selectedUser.id !== user.id && (
              <div className="absolute top-4 left-4">
                <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-200">
                  Override Active
                </span>
              </div>
            )}
            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm transition-transform hover:scale-105">
              <UserCircle className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
            <div className="flex flex-col items-center mt-2 space-y-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                selectedUser.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                selectedUser.role === UserRole.HR ? 'bg-purple-50 text-purple-600 border-purple-100' :
                'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {selectedUser.role.replace('_', ' ')}
              </span>
              <p className="text-[10px] font-bold text-slate-400">@{selectedUser.username}</p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-slate-500 font-bold uppercase">Security</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">Verified</span>
              </div>
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-bold uppercase">System ID</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{selectedUser.id}</span>
              </div>
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-bold uppercase">Compensation</span>
                </div>
                <span className="text-xs font-bold text-slate-900">${selectedUser.salary.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <div className="p-3 bg-white/10 rounded-xl w-fit text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-bold">Access Integrity</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Passwords should be unique and complex. System administrators can grant or revoke specific feature access dynamically to any profile.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Login Username</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">System Role</label>
                    <select 
                      disabled={!isAdmin}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-60"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    >
                      {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{role.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Monthly Salary ({isAdmin ? 'Editable' : 'View Only'})</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        disabled={!isAdmin}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-60"
                        value={formData.salary}
                        onChange={e => setFormData({...formData, salary: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Feature Authorization Override</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableFeatures.map((feature) => (
                        <button
                          key={feature.id}
                          type="button"
                          onClick={() => togglePermission(feature.id)}
                          className={`flex items-center space-x-2 p-3 rounded-xl border transition-all text-left ${
                            formData.permissions?.includes(feature.id)
                              ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <feature.icon className={`w-3.5 h-3.5 ${formData.permissions?.includes(feature.id) ? 'text-blue-600' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-bold uppercase truncate">{feature.label}</span>
                          {formData.permissions?.includes(feature.id) && (
                            <Check className="w-3 h-3 ml-auto text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-8 mt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Key className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Security Credentials</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                        {isAdmin && selectedUser.id !== user.id ? `Force Password Reset for ${selectedUser.name}` : "Change Account Password"}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Enter 8+ characters"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Leave empty if you don't wish to change the current password.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-3 text-red-500 bg-red-50 p-4 rounded-2xl animate-in shake duration-500 border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">{error}</span>
                  </div>
                )}

                {isSaved && (
                  <div className="flex items-center space-x-3 text-emerald-600 bg-emerald-50 p-4 rounded-2xl animate-in slide-in-from-top-2 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">Profile updated successfully!</span>
                  </div>
                )}

                <div className="pt-6 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isAdmin && selectedUser.id !== user.id ? 'Override Profile' : 'Apply Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
