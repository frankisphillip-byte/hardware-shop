const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

async function apiCall(endpoint: string, options: RequestOptions = {}) {
  const url = `${API_URL}/api${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

export const apiService = {
  // Products
  getProducts: () => apiCall('/products'),
  getProduct: (id: string) => apiCall(`/products/${id}`),
  createProduct: (product: any) =>
    apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  updateProduct: (id: string, product: any) =>
    apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  deleteProduct: (id: string) =>
    apiCall(`/products/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => apiCall('/inventory'),
  updateInventory: (productId: string, quantity: number) =>
    apiCall('/inventory', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  // Sales
  getSales: () => apiCall('/sales'),
  createSale: (sale: any) =>
    apiCall('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    }),

  // Customers
  getCustomers: () => apiCall('/customers'),
  createCustomer: (customer: any) =>
    apiCall('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    }),

  // Categories
  getCategories: () => apiCall('/categories'),

  // Suppliers
  getSuppliers: () => apiCall('/suppliers'),
  createSupplier: (supplier: any) =>
    apiCall('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    }),

  // Purchase Orders
  getPurchaseOrders: () => apiCall('/purchase-orders'),
  createPurchaseOrder: (order: any) =>
    apiCall('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
};
