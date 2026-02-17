# Frontend & Backend Deployment Setup

## Current Status

✅ **Backend API** - Live on Vercel  
✅ **Frontend** - Live on Vercel  
✅ **Database** - Supabase (11 tables created)

## Your Live URLs

- **Frontend**: https://hardware-shop-five.vercel.app
- **Backend API**: https://kkph0ek7h-frankisphillip-bytes-projects.vercel.app
- **Supabase Project**: https://app.supabase.com (ipxhctbdpdpfifmfgynm)

## Connect Frontend to Backend

### Step 1: Add Environment Variable to Frontend Deployment

1. Go to: https://vercel.com/dashboard
2. Click on **hardware-shop** project
3. Click **Settings** → **Environment Variables**
4. Add this variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://kkph0ek7h-frankisphillip-bytes-projects.vercel.app`
5. Click **Save**

### Step 2: Redeploy Frontend

1. In Vercel dashboard, click **Deployments**
2. Click the three dots on the latest deployment
3. Click **Redeploy**

### Step 3: Test the Connection

1. Go to your frontend: https://hardware-shop-five.vercel.app
2. Try adding a product, recording a sale, or checking inventory
3. Check the backend API: https://kkph0ek7h-frankisphillip-bytes-projects.vercel.app/api/products

## API Endpoints Available

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Inventory
- `GET /api/inventory` - Get all inventory
- `POST /api/inventory` - Update stock level

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Record new sale

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier

### Purchase Orders
- `GET /api/purchase-orders` - Get all orders
- `POST /api/purchase-orders` - Create purchase order

## Troubleshooting

### "API is not responding"
- Check your backend is running: https://kkph0ek7h-frankisphillip-bytes-projects.vercel.app
- Check Vercel deployment status
- Check browser console for error messages

### "Data not saving"
- Verify Supabase credentials in backend `.env`
- Check Supabase dashboard to see if tables have data
- Check API logs in Vercel

### Backend needs restart
- Redeploy the backend project in Vercel

## What's Working

✅ User authentication (mock)
✅ Product management
✅ Inventory tracking
✅ Sales recording
✅ Customer management
✅ Supplier management
✅ Sales reports and analytics
✅ Low stock alerts
