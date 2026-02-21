import React, { useMemo } from 'react';
import { Sale, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';

interface ReportsProps {
  sales: Sale[];
  products: Product[];
}

const Reports: React.FC<ReportsProps> = ({ sales, products }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalTransactions = sales.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    return { totalRevenue, totalTransactions, avgTransaction };
  }, [sales]);

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    sales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock < 10).sort((a, b) => a.stock - b.stock);
  }, [products]);

  const salesByDate = useMemo(() => {
    const grouped: Record<string, { date: string; total: number; count: number }> = {};
    sales.forEach((sale) => {
      const date = new Date(sale.date).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = { date, total: 0, count: 0 };
      }
      grouped[date].total += sale.total || 0;
      grouped[date].count += 1;
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <ShoppingBag size={24} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Transaction</p>
              <p className="text-2xl font-bold text-gray-800">${stats.avgTransaction.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      {salesByDate.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales by Date</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No sales data available</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{product.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({product.quantity} sold)</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">${product.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            Low Stock Alerts
          </h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">All products are well stocked</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-800">{product.name}</span>
                  <span className={`text-sm font-semibold ${product.stock <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales Table */}
      {salesByDate.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Sales Summary</h3>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Transactions</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesByDate.map((day, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{day.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{day.count}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">${day.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
