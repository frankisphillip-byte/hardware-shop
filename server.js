const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());

// ==================== PRODUCTS ====================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const { sku, name, description, category_id, price, cost, stock_quantity, min_stock_level } = req.body;
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          sku,
          name,
          description,
          category_id,
          price,
          cost,
          stock_quantity,
          min_stock_level
        }
      ])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== INVENTORY ====================

// Record inventory transaction
app.post('/api/inventory/transaction', async (req, res) => {
  try {
    const { product_id, transaction_type, quantity, notes } = req.body;
    
    // Create transaction
    const { error: txError } = await supabase
      .from('inventory_transactions')
      .insert([{ product_id, transaction_type, quantity, notes }]);
    if (txError) throw txError;
    
    // Update product stock
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', product_id)
      .single();
    
    const newStock = transaction_type === 'IN' 
      ? product.stock_quantity + quantity 
      : product.stock_quantity - quantity;
    
    const { data, error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', product_id)
      .select();
    
    if (updateError) throw updateError;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory status
app.get('/api/inventory/status', async (req, res) => {
  try {
    const { data, error } = await supabase.from('inventory_status').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SALES ====================

// Create sale
app.post('/api/sales', async (req, res) => {
  try {
    const { customer_id, items, discount, payment_method } = req.body;
    
    // Calculate totals
    let total_amount = 0;
    items.forEach(item => {
      total_amount += item.subtotal;
    });
    const final_amount = total_amount - (discount || 0);
    
    // Create sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{
        customer_id,
        total_amount,
        discount: discount || 0,
        final_amount,
        payment_method,
        status: 'COMPLETED'
      }])
      .select();
    
    if (saleError) throw saleError;
    const sale_id = saleData[0].id;
    
    // Add sale items
    const saleItems = items.map(item => ({
      sale_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal
    }));
    
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    
    if (itemsError) throw itemsError;
    
    res.status(201).json(saleData[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales
app.get('/api/sales', async (req, res) => {
  try {
    const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== REPORTS ====================

// Daily sales summary
app.get('/api/reports/daily-sales', async (req, res) => {
  try {
    const { data, error } = await supabase.from('daily_sales_summary').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top selling products
app.get('/api/reports/top-products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('top_selling_products').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CUSTOMERS ====================

app.get('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SERVER ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hardware Store API running on port ${PORT}`);
});

module.exports = app;