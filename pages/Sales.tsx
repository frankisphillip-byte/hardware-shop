import React, { useState } from 'react';
import { Sale, Product, SaleItem } from '../types';
import { salesAPI } from '../services/api';
import { Plus, ShoppingCart, X, DollarSign } from 'lucide-react';

interface SalesProps {
  sales: Sale[];
  products: Product[];
  onSalesChange: (sales: Sale[]) => void;
}

const Sales: React.FC<SalesProps> = ({ sales, products, onSalesChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [error, setError] = useState('');

  const addToCart = (productId: string) => {
    const existing = cartItems.find((item) => item.productId === productId);
    if (existing) {
      setCartItems(cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { productId, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleRecordSale = async () => {
    if (cartItems.length === 0) {
      setError('Please add at least one item');
      return;
    }
    try {
      const saleItems: SaleItem[] = cartItems.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          cost: product.cost,
        };
      });
      const subtotal = saleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.1;
      const newSale: Partial<Sale> = {
        date: new Date().toISOString(),
        items: saleItems,
        subtotal,
        tax,
        total: subtotal + tax,
        paymentMethod,
        cashierId: 'current-user',
      };
      const result = await salesAPI.create(newSale);
      if (result && result[0]) {
        onSalesChange([...sales, result[0]]);
      }
      setCartItems([]);
      setPaymentMethod('Cash');
      setShowModal(false);
      setError('');
    } catch (err) {
      console.error('Error recording sale:', err);
      setError('Failed to record sale. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sales</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          Record Sale
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No sales recorded yet</h3>
          <p className="text-gray-400 mt-1">Click "Record Sale" to add your first transaction</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {sale.items?.length || 0} item(s)
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    ${sale.total?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                      {sale.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Record New Sale</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Products</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border rounded-lg p-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product.id)}
                      className="text-left p-2 rounded hover:bg-indigo-50 border border-gray-200 text-sm"
                    >
                      <div className="font-medium text-gray-800">{product.name}</div>
                      <div className="text-gray-500">${product.price?.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {cartItems.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cart</label>
                  <div className="space-y-2">
                    {cartItems.map((item) => {
                      const product = products.find((p) => p.id === item.productId);
                      return (
                        <div key={item.productId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">
                            {product?.name} x {item.quantity}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              ${((product?.price || 0) * item.quantity).toFixed(2)}
                            </span>
                            <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Mobile">Mobile Payment</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg mb-4">
                <span className="font-medium text-gray-700">Total:</span>
                <span className="text-xl font-bold text-indigo-600">
                  <DollarSign size={18} className="inline" />
                  {getCartTotal().toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleRecordSale}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
