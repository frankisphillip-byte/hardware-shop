
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Accounting from './pages/Accounting';
import Employees from './pages/Employees';
import Deliveries from './pages/Deliveries';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { User, UserRole, Product, Sale, Expense, Delivery, IncomingDelivery, AuditLog, LogType, SystemConfig, Branch } from './types';
import { initialProducts, initialUsers, initialSales, initialExpenses, initialDeliveries, initialIncoming } from './services/mockData';

const App: React.FC = () => {
  // Persistence Helper
  const loadState = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(`hmp_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Persisted States
  const [products, setProducts] = useState<Product[]>(() => loadState('products', initialProducts));
  const [users, setUsers] = useState<User[]>(() => loadState('users', initialUsers));
  const [sales, setSales] = useState<Sale[]>(() => loadState('sales', initialSales));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadState('expenses', initialExpenses));
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => loadState('deliveries', initialDeliveries));
  const [incomingDeliveries, setIncomingDeliveries] = useState<IncomingDelivery[]>(() => loadState('incoming', initialIncoming));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadState('logs', []));
  const [branches, setBranches] = useState<Branch[]>(() => loadState('branches', [
    { id: 'b1', name: 'Main Warehouse' },
    { id: 'b2', name: 'Downtown Branch' }
  ]));
  
  const [config, setConfig] = useState<SystemConfig>(() => loadState('config', {
    storeName: 'My Local Hardware', 
    currency: 'USD',
    lowStockThreshold: 10,
    taxRate: 15,
    aiEnabled: true,
    paymentMethods: ['Ecocash (Mobile)', 'Card', 'USD Cash', 'ZWL Cash']
  }));

  // Sync hooks
  useEffect(() => localStorage.setItem('hmp_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('hmp_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('hmp_sales', JSON.stringify(sales)), [sales]);
  useEffect(() => localStorage.setItem('hmp_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('hmp_deliveries', JSON.stringify(deliveries)), [deliveries]);
  useEffect(() => localStorage.setItem('hmp_incoming', JSON.stringify(incomingDeliveries)), [incomingDeliveries]);
  useEffect(() => localStorage.setItem('hmp_logs', JSON.stringify(auditLogs)), [auditLogs]);
  useEffect(() => localStorage.setItem('hmp_config', JSON.stringify(config)), [config]);
  useEffect(() => localStorage.setItem('hmp_branches', JSON.stringify(branches)), [branches]);

  const addLog = useCallback((type: LogType, target: string, details: string, severity: AuditLog['severity'] = 'info') => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      type,
      target,
      details,
      severity
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 500));
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    addLog('LOGIN', 'Auth', `${user.name} authenticated successfully.`, 'success');
  };

  const handleLogout = () => {
    if (currentUser) {
      addLog('LOGIN', 'Session', `${currentUser.name} logged out.`);
    }
    setCurrentUser(null);
    setSidebarOpen(false);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <Sidebar 
          role={currentUser.role} 
          permissions={currentUser.permissions}
          onLogout={handleLogout} 
          storeName={config.storeName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          {/* Decorative Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

          <Header 
            user={currentUser} 
            products={products}
            deliveries={deliveries}
            lowStockThreshold={config.lowStockThreshold}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 lg:p-10 scrollbar-hide">
            <div className="max-w-[1600px] mx-auto pb-20 lg:pb-0">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route 
                  path="/dashboard" 
                  element={<Dashboard products={products} sales={sales} expenses={expenses} lowStockThreshold={config.lowStockThreshold} aiEnabled={config.aiEnabled} />} 
                />
                <Route 
                  path="/pos" 
                  element={<POS products={products} setProducts={setProducts} sales={sales} setSales={setSales} currentUser={currentUser} addLog={addLog} taxRate={config.taxRate} storeName={config.storeName} paymentMethods={config.paymentMethods} />} 
                />
                <Route 
                  path="/inventory" 
                  element={<Inventory products={products} setProducts={setProducts} role={currentUser.role} addLog={addLog} lowStockThreshold={config.lowStockThreshold} />} 
                />
                <Route 
                  path="/accounting" 
                  element={<Accounting sales={sales} expenses={expenses} setExpenses={setExpenses} role={currentUser.role} logs={auditLogs} products={products} users={users} taxRate={config.taxRate} />} 
                />
                <Route 
                  path="/employees" 
                  element={<Employees users={users} setUsers={setUsers} role={currentUser.role} addLog={addLog} />} 
                />
                <Route 
                  path="/deliveries" 
                  element={
                    <Deliveries 
                      deliveries={deliveries} 
                      setDeliveries={setDeliveries} 
                      incomingDeliveries={incomingDeliveries}
                      setIncomingDeliveries={setIncomingDeliveries}
                      products={products}
                      setProducts={setProducts}
                      role={currentUser.role} 
                      currentUser={currentUser} 
                      sales={sales} 
                      addLog={addLog}
                      branches={branches}
                      storeName={config.storeName}
                    />
                  } 
                />
                <Route 
                  path="/settings" 
                  element={<Settings config={config} setConfig={setConfig} role={currentUser.role} addLog={addLog} branches={branches} setBranches={setBranches} />} 
                />
                <Route 
                  path="/profile" 
                  element={<Profile user={currentUser} allUsers={users} updateUser={updateUser} addLog={addLog} />} 
                />
                <Route path="*" element={<div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">Entry Restricted: Resource Not Found</div>} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
