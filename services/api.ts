import { supabase } from '../src/supabaseClient';
import { Product, Sale, Customer } from '../types';

// Products API
export const productsAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (product: Partial<Product>) => {
    const { data, error } = await supabase.from('products').insert([product]).select();
    if (error) throw error;
    return data;
  },
  update: async (id: string, product: Partial<Product>) => {
    const { data, error } = await supabase.from('products').update(product).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data;
  },
  create: async (name: string) => {
    const { data, error } = await supabase.from('categories').insert([{ name }]).select();
    if (error) throw error;
    return data;
  },
};

// Inventory API (assuming inventory is part of products for now, or a separate table)
export const inventoryAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('products').select('*'); // Adjust if inventory is a separate table
    if (error) throw error;
    return data;
  },
  getByProductId: async (productId: string) => {
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error) throw error;
    return data;
  },
  updateStock: async (productId: string, quantity: number) => {
    // This assumes stock is updated directly on the product table
    const { data, error } = await supabase.from('products').update({ stock: quantity }).eq('id', productId).select();
    if (error) throw error;
    return data;
  },
};

// Sales API
export const salesAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('sales').select('*, sale_items(*)');
    if (error) throw error;
    return data;
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('sales').select('*, sale_items(*)').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (sale: Partial<Sale>) => {
    const { data, error } = await supabase.from('sales').insert([sale]).select();
    if (error) throw error;
    return data;
  },
};

// Customers API (assuming a customers table exists)
export const customersAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) throw error;
    return data;
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (customer: Partial<Customer>) => {
    const { data, error } = await supabase.from('customers').insert([customer]).select();
    if (error) throw error;
    return data;
  },
  update: async (id: string, customer: Partial<Customer>) => {
    const { data, error } = await supabase.from('customers').update(customer).eq('id', id).select();
    if (error) throw error;
    return data;
  },
};

// Suppliers API (assuming a suppliers table exists)
export const suppliersAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) throw error;
    return data;
  },
  create: async (supplier: any) => {
    const { data, error } = await supabase.from('suppliers').insert([supplier]).select();
    if (error) throw error;
    return data;
  },
};

// Purchase Orders API (assuming a purchase_orders table exists)
export const purchaseOrdersAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('purchase_orders').select('*');
    if (error) throw error;
    return data;
  },
  create: async (order: any) => {
    const { data, error } = await supabase.from('purchase_orders').insert([order]).select();
    if (error) throw error;
    return data;
  },
};
