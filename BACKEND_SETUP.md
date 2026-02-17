# Hardware Store Backend - Setup Instructions

## Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account (free tier available)

---

## Step 1: Set Up Supabase Database

1. Go to [Supabase](https://supabase.com)
2. Create a new project (or use existing)
3. Open the SQL Editor
4. Copy the entire contents of `database/schema.sql`
5. Paste into the SQL Editor
6. Run the query to create all tables and views

---

## Step 2: Get Supabase Credentials

1. In Supabase Dashboard, go to Settings → API
2. Copy your:
   - **Project URL** (SUPABASE_URL)
   - **Anon Public Key** (SUPABASE_KEY)

---

## Step 3: Set Up Backend

1. Clone this repository (already done)
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and paste your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_public_key
   PORT=3000
   ```

---

## Step 4: Start the Server

```bash
npm start
```

Server will run on `http://localhost:3000`

---

## Step 5: Test the API

Test with curl or Postman:

```bash
# Get all products
curl http://localhost:3000/api/products

# Create a category (insert directly in Supabase)
# Then create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "HW-001",
    "name": "Hammer",
    "category_id": 1,
    "price": 29.99,
    "cost": 15.00,
    "stock_quantity": 45,
    "min_stock_level": 10
  }'
```

---

## Database Schema Overview

### Core Tables
- **categories** - Product categories
- **products** - Hardware items with pricing & stock
- **customers** - Customer information
- **sales** - Transaction records
- **sale_items** - Individual line items in sales

### Inventory Management
- **inventory_transactions** - Track stock movements
- **stock_alerts** - Low stock notifications

### Supplier Management
- **suppliers** - Vendor information
- **purchase_orders** - Incoming orders
- **po_items** - Line items for POs

### Reporting
- **daily_sales_summary** - VIEW: Daily revenue & transactions
- **inventory_status** - VIEW: Current stock levels
- **top_selling_products** - VIEW: Sales analytics

---

## Common Tasks

### Add Stock to Product
```bash
curl -X POST http://localhost:3000/api/inventory/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "transaction_type": "IN",
    "quantity": 20,
    "notes": "Received from supplier ABC"
  }'
```

### Record a Sale
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "quantity": 2, "unit_price": 29.99, "subtotal": 59.98}
    ],
    "discount": 0,
    "payment_method": "CASH"
  }'
```

### View Sales Report
```bash
curl http://localhost:3000/api/reports/daily-sales
```

---

## Deployment

For production:
1. Use environment variables from your hosting provider
2. Add authentication (JWT recommended)
3. Add validation middleware
4. Set up HTTPS
5. Consider using a process manager like PM2

---

## Support

For Supabase issues: https://supabase.com/docs
For Express.js issues: https://expressjs.com/