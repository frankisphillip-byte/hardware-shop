const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const { timeout = 10000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const apiService = {
  // Products
  async getProducts() {
    return fetchWithTimeout(`${API_URL}/api/products`);
  },
  async getProduct(id: string) {
    return fetchWithTimeout(`${API_URL}/api/products/${id}`);
  },
  async createProduct(data: any) {
    return fetchWithTimeout(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  async updateProduct(id: string, data: any) {
    return fetchWithTimeout(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  async deleteProduct(id: string) {
    return fetchWithTimeout(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  async getCategories() {
    return fetchWithTimeout(`${API_URL}/api/categories`);
  },
  async createCategory(data: any) {
    return fetchWithTimeout(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Sales
  async getSales() {
    return fetchWithTimeout(`${API_URL}/api/sales`);
  },
  async createSale(data: any) {
    return fetchWithTimeout(`${API_URL}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Customers
  async getCustomers() {
    return fetchWithTimeout(`${API_URL}/api/customers`);
  },
  async createCustomer(data: any) {
    return fetchWithTimeout(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Suppliers
  async getSuppliers() {
    return fetchWithTimeout(`${API_URL}/api/suppliers`);
  },
  async createSupplier(data: any) {
    return fetchWithTimeout(`${API_URL}/api/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Purchase Orders
  async getPurchaseOrders() {
    return fetchWithTimeout(`${API_URL}/api/purchase-orders`);
  },
  async createPurchaseOrder(data: any) {
    return fetchWithTimeout(`${API_URL}/api/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Reports
  async getSalesReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchWithTimeout(`${API_URL}/api/reports/sales?${params}`);
  },
  async getInventoryReport() {
    return fetchWithTimeout(`${API_URL}/api/reports/inventory`);
  },
};
