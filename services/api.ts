// API Service - Connects frontend to Supabase backend
import { Product, Sale, Customer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://kkph0ek7h-frankisphillip-bytes-projects.vercel.app';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Products API
export const productsAPI = {
  getAll: () => apiCall('/api/products'),
  getById: (id: string) => apiCall(`/api/products/${id}`),
  create: (product: Partial<Product>) => 
    apiCall('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  update: (id: string, product: Partial<Product>) =>
    apiCall(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  delete: (id: string) =>
    apiCall(`/api/products/${id}`, { method: 'DELETE' }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiCall('/api/categories'),
  create: (name: string) =>
    apiCall('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => apiCall('/api/inventory'),
  getByProductId: (productId: string) => apiCall(`/api/inventory?product_id=${productId}`),
  updateStock: (productId: string, quantity: number) =>
    apiCall('/api/inventory', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
};

// Sales API
export const salesAPI = {
  getAll: () => apiCall('/api/sales'),
  getById: (id: string) => apiCall(`/api/sales/${id}`),
  create: (sale: Partial<Sale>) =>
    apiCall('/api/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    }),
};

// Customers API
export const customersAPI = {
  getAll: () => apiCall('/api/customers'),
  getById: (id: string) => apiCall(`/api/customers/${id}`),
  create: (customer: Partial<Customer>) =>
    apiCall('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    }),
  update: (id: string, customer: Partial<Customer>) =>
    apiCall(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    }),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => apiCall('/api/suppliers'),
  create: (supplier: any) =>
    apiCall('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    }),
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: () => apiCall('/api/purchase-orders'),
  create: (order: any) =>
    apiCall('/api/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
};
