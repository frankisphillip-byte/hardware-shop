const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const handleApiError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const apiService = {
  // Products
  async getProducts() {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch products:', handleApiError(error));
      return null;
    }
  },

  async createProduct(product: any) {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to create product:', handleApiError(error));
      return null;
    }
  },

  async updateProduct(id: string, product: any) {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to update product:', handleApiError(error));
      return null;
    }
  },

  // Sales
  async getSales() {
    try {
      const response = await fetch(`${API_URL}/api/sales`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch sales:', handleApiError(error));
      return null;
    }
  },

  async createSale(sale: any) {
    try {
      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to create sale:', handleApiError(error));
      return null;
    }
  },

  // Customers
  async getCustomers() {
    try {
      const response = await fetch(`${API_URL}/api/customers`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch customers:', handleApiError(error));
      return null;
    }
  },

  // Suppliers
  async getSuppliers() {
    try {
      const response = await fetch(`${API_URL}/api/suppliers`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch suppliers:', handleApiError(error));
      return null;
    }
  },

  // Categories
  async getCategories() {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch categories:', handleApiError(error));
      return null;
    }
  },

  // Inventory Alerts
  async getAlerts() {
    try {
      const response = await fetch(`${API_URL}/api/alerts`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch alerts:', handleApiError(error));
      return null;
    }
  },
};
