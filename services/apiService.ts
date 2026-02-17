const API_URL = import.meta.env.VITE_API_URL || 'https://kkph0ek7h-frankisphillip-bytes-projects.vercel.app';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Products
export async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return null;
  }
}

export async function createProduct(product: any) {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to create product:', error);
    return null;
  }
}

export async function updateProduct(id: string, product: any) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to update product:', error);
    return null;
  }
}

// Sales
export async function fetchSales() {
  try {
    const response = await fetch(`${API_URL}/sales`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    return null;
  }
}

export async function createSale(sale: any) {
  try {
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to create sale:', error);
    return null;
  }
}

// Users
export async function fetchUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return null;
  }
}

export async function updateUser(id: string, user: any) {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to update user:', error);
    return null;
  }
}

// Inventory
export async function fetchInventory() {
  try {
    const response = await fetch(`${API_URL}/inventory`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return null;
  }
}

// Expenses
export async function fetchExpenses() {
  try {
    const response = await fetch(`${API_URL}/expenses`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return null;
  }
}

export async function createExpense(expense: any) {
  try {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to create expense:', error);
    return null;
  }
}

// Check if API is available
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_URL}/health`, { method: 'GET' });
    return response.ok;
  } catch (error) {
    return false;
  }
}
