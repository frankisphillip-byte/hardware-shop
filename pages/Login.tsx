
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Hammer, Lock, User as UserIcon, AlertCircle, Info, ChevronRight } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Invalid username or password. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-4">
            <Hammer className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">frankisdigital</h1>
          <p className="text-slate-500 mt-2 font-medium uppercase tracking-widest text-[10px]">Enterprise Pro Edition</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">System Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter your username"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-12 py-3.5 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Access Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-12 py-3.5 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl animate-in fade-in zoom-in-95">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>AUTHORIZE ACCESS</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button 
              onClick={() => setShowDemo(!showDemo)}
              className="flex items-center justify-center space-x-2 w-full py-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"
            >
              <Info className="w-3 h-3" />
              <span>Demo Account Credentials</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${showDemo ? 'rotate-90' : ''}`} />
            </button>
            
            {showDemo && (
              <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2">
                <CredentialRow role="Admin" user="Phillipfrankis" pass="1234567890" />
                <CredentialRow role="Cashier" user="sara" pass="123" />
                <CredentialRow role="Warehouse Clerk" user="mike" pass="123" />
                <CredentialRow role="HR Manager" user="helen" pass="123" />
              </div>
            )}
          </div>
        </div>
        
        <p className="text-center mt-6 text-slate-600 text-[10px] font-medium uppercase tracking-widest">
          Secure Multi-Role Access Management Environment
        </p>
      </div>
    </div>
  );
};

const CredentialRow = ({ role, user, pass }: { role: string, user: string, pass: string }) => (
  <div className="flex justify-between items-center text-[9px]">
    <span className="text-slate-500 font-black uppercase tracking-tighter w-24">{role}:</span>
    <span className="text-blue-400 font-mono">{user}</span>
    <span className="text-slate-600">/</span>
    <span className="text-emerald-400 font-mono">{pass}</span>
  </div>
);

export default Login;