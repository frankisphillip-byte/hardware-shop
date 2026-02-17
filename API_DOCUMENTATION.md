# Hardware Store Management System - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently no authentication is implemented. Add JWT or API keys as needed.

---

## Products

### Get All Products
```
GET /products
```
**Response:**
```json
[
  {
    "id": 1,
    "sku": "HW-001",
    "name": "Hammer",
    "description": "Claw Hammer 16oz",
    "category_id": 1,
    "price": 29.99,
    "cost": 15.00,
    "stock_quantity": 45,
    "min_stock_level": 10,
    "is_active": true,
    "created_at": "2025-02-17T08:00:00",
    "updated_at": "2025-02-17T08:00:00"
  }
]
```

### Get Product by ID
```
GET /products/:id
```

### Create Product
```
POST /products
Content-Type: application/json

{
  "sku": "HW-002",
  "name": "Screwdriver Set",
  "description": "12-piece screwdriver set",
  "category_id": 2,
  "price": 24.99,
  "cost": 10.00,
  "stock_quantity": 30,
  "min_stock_level": 5
}
```

### Update Product
```
PUT /products/:id
Content-Type: application/json

{
  "price": 34.99,
  "stock_quantity": 50
}
```

---

## Inventory

### Record Inventory Transaction
```
POST /inventory/transaction
Content-Type: application/json

{
  "product_id": 1,
  "transaction_type": "IN",  // IN, OUT, ADJUSTMENT
  "quantity": 20,
  "notes": "Received from supplier"
}
```

### Get Inventory Status
```
GET /inventory/status
```
**Response includes stock status:** IN_STOCK, LOW_STOCK, OUT_OF_STOCK

---

## Sales

### Create Sale
```
POST /sales
Content-Type: application/json

{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 29.99,
      "subtotal": 59.98
    },
    {
      "product_id": 2,
      "quantity": 1,
      "unit_price": 24.99,
      "subtotal": 24.99
    }
  ],
  "discount": 5.00,
  "payment_method": "CARD"
}
```

### Get Sales
```
GET /sales
```

---

## Customers

### Get All Customers
```
GET /customers
```

### Create Customer
```
POST /customers
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "address": "123 Main St",
  "city": "Springfield",
  "postal_code": "12345"
}
```

---

## Reports

### Daily Sales Summary
```
GET /reports/daily-sales
```
**Response:**
```json
[
  {
    "sale_date": "2025-02-17",
    "total_transactions": 12,
    "total_revenue": 1245.50,
    "avg_transaction_value": 103.79
  }
]
```

### Top Selling Products
```
GET /reports/top-products
```

---

## Error Handling

All errors return JSON with an error message:
```json
{
  "error": "Error description"
}
```

---

## Status Codes
- **200** - OK
- **201** - Created
- **400** - Bad Request
- **404** - Not Found
- **500** - Internal Server Error