import React, { useState, useEffect } from 'react';
import { Menu, Plus, LogOut } from 'lucide-react';
import { Product, Sale, Customer, Supplier, Category } from './types';
import { productsAPI, categoriesAPI, salesAPI, customersAPI, suppliersAPI } from './services/api';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';

type Page = 'dashboard' | 'inventory' | 'sales' | 'customers' | 'suppliers' | 'reports';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load data from API on startup
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData, salesData, customersData, suppliersData] = await Promise.all([
          productsAPI.getAll().catch(() => []),
          categoriesAPI.getAll().catch(() => []),
          salesAPI.getAll().catch(() => []),
          customersAPI.getAll().catch(() => []),
          suppliersAPI.getAll().catch(() => []),
        ]);

        setProducts(productsData || []);
        setCategories(categoriesData || []);
        setSales(salesData || []);
        setCustomers(customersData || []);
        setSuppliers(suppliersData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        // Use fallback - show empty state
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate login delay - in real app, this would validate credentials
    setTimeout(() => {
      if (!isLoggedIn) {
        // Auto-login for demo - remove in production
        handleLogin('demo', 'password');
      }
    }, 1000);
  }, []);

  const handleLogin = (user: string, pass: string) => {
    if (user && pass) {
      setIsLoggedIn(true);
      setUsername(user);
      setLoginError('');
      loadData();
    } else {
      setLoginError('Please enter username and password');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData, salesData, customersData, suppliersData] = await Promise.all([
        productsAPI.getAll().catch(() => []),
        categoriesAPI.getAll().catch(() => []),
        salesAPI.getAll().catch(() => []),
        customersAPI.getAll().catch(() => []),
        suppliersAPI.getAll().catch(() => []),
      ]);

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setSales(salesData || []);
      setCustomers(customersData || []);
      setSuppliers(suppliersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setCurrentPage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Hardware Store System...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">Hardware Store</h1>
          <p className="text-center text-gray-600 mb-6">Management System</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(username, password);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
            {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Sign In
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-4">Demo: Any username/password</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-indigo-900 text-white transition-all duration-300 ease-in-out fixed md:static h-full z-40`}
      >
        <div className="p-6 border-b border-indigo-800">
          <h1 className="text-2xl font-bold">HW Store</h1>
          <p className="text-indigo-300 text-sm">Management</p>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'inventory', label: 'Inventory', icon: '📦' },
            { id: 'sales', label: 'Sales', icon: '💳' },
            { id: 'customers', label: 'Customers', icon: '👥' },
            { id: 'suppliers', label: 'Suppliers', icon: '🏭' },
            { id: 'reports', label: 'Reports', icon: '📈' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id as Page);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                currentPage === item.id
                  ? 'bg-indigo-700 text-white font-semibold'
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-white font-semibold"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 capitalize">{currentPage}</h2>
                <p className="text-sm text-gray-500">Welcome, {username}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              <Plus size={20} />
              Add New
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {currentPage === 'dashboard' && <Dashboard products={products} sales={sales} />}
          {currentPage === 'inventory' && <Inventory products={products} categories={categories} onProductsChange={setProducts} />}
          {currentPage === 'sales' && <Sales sales={sales} products={products} onSalesChange={setSales} />}
          {currentPage === 'customers' && <Customers customers={customers} onCustomersChange={setCustomers} />}
          {currentPage === 'suppliers' && <Suppliers suppliers={suppliers} onSuppliersChange={setSuppliers} />}
          {currentPage === 'reports' && <Reports sales={sales} products={products} />}
        </div>
      </div>
    </div>
  );
}

export default App;
