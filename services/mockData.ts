
import { User, UserRole, Product, Sale, Expense, Delivery, IncomingDelivery } from '../types';

export const initialUsers: User[] = [
  { 
    id: 'u1', 
    name: 'Phillip Frankis', 
    username: 'Phillipfrankis', 
    password: '1234567890', 
    role: UserRole.ADMIN, 
    salary: 7500,
    branchId: 'b1',
    permissions: ['dashboard', 'pos', 'inventory', 'accounting', 'employees', 'deliveries']
  },
  { 
    id: 'u2', 
    name: 'Sara Cashier', 
    username: 'sara', 
    password: '123', 
    role: UserRole.CASHIER, 
    salary: 2500,
    branchId: 'b2',
    permissions: ['pos', 'deliveries']
  },
  { 
    id: 'u3', 
    name: 'Mike Clerk', 
    username: 'mike', 
    password: '123', 
    role: UserRole.WAREHOUSE_CLERK, 
    salary: 2800,
    branchId: 'b1',
    permissions: ['inventory', 'deliveries']
  },
  { 
    id: 'u4', 
    name: 'Dave Driver', 
    username: 'dave', 
    password: '123', 
    role: UserRole.DRIVER, 
    salary: 2200,
    branchId: 'b1',
    permissions: ['deliveries']
  },
  { 
    id: 'u5', 
    name: 'Helen HR', 
    username: 'helen', 
    password: '123', 
    role: UserRole.HR, 
    salary: 3200,
    branchId: 'b1',
    permissions: ['dashboard', 'employees']
  },
];

export const initialProducts: Product[] = [
  { id: 'p1', name: 'Power Drill 18V', category: 'Tools', price: 129.99, cost: 75.00, stock: 15, sku: 'DR-18V-P', barcode: '5012345678901', boxQuantity: 5, location: 'Shop', branchId: 'b1', history: [] },
  { id: 'p1_w', name: 'Power Drill 18V', category: 'Tools', price: 129.99, cost: 75.00, stock: 100, sku: 'DR-18V-P', barcode: '5012345678901', boxQuantity: 5, location: 'Warehouse', branchId: 'b1', history: [] },
  { id: 'p2', name: 'Lumber 2x4 8ft', category: 'Lumber', price: 8.50, cost: 4.20, stock: 250, sku: 'LB-24-8', barcode: '5012345678902', boxQuantity: 20, location: 'Shop', branchId: 'b2', history: [] },
  { id: 'p2_w', name: 'Lumber 2x4 8ft', category: 'Lumber', price: 8.50, cost: 4.20, stock: 1000, sku: 'LB-24-8', barcode: '5012345678902', boxQuantity: 20, location: 'Warehouse', branchId: 'b1', history: [] },
  { id: 'p3', name: 'Copper Pipe 1/2in', category: 'Plumbing', price: 12.00, cost: 6.50, stock: 45, sku: 'PL-CP-12', barcode: '5012345678903', boxQuantity: 10, location: 'Shop', branchId: 'b2', history: [] },
  { id: 'p4', name: 'Flat White Paint 5G', category: 'Paint', price: 89.00, cost: 55.00, stock: 20, sku: 'PT-FW-5G', barcode: '5012345678904', boxQuantity: 1, location: 'Shop', branchId: 'b2', history: [] },
  { id: 'p5', name: 'LED Light Bulb 4pk', category: 'Electrical', price: 15.99, cost: 8.00, stock: 80, sku: 'EL-LB-4', barcode: '5012345678905', boxQuantity: 48, location: 'Shop', branchId: 'b2', history: [] },
];

export const initialSales: Sale[] = [
  { 
    id: 's1', 
    date: '2024-05-01', 
    subtotal: 130.86,
    tax: 19.63,
    total: 150.49, 
    cashierId: 'u2', 
    paymentMethod: 'USD Cash',
    items: [
      { productId: 'p1', name: 'Power Drill 18V', quantity: 1, price: 129.99, cost: 75.00 }, 
      { productId: 'p3', name: 'Copper Pipe 1/2in', quantity: 2, price: 10.25, cost: 6.50 }
    ] 
  },
];

export const initialExpenses: Expense[] = [
  { id: 'e1', date: '2024-05-01', description: 'Store Rent May', amount: 2000, category: 'Rent' },
  { id: 'e2', date: '2024-05-05', description: 'Restock Hardware', amount: 500, category: 'Stock Purchase' },
];

export const initialDeliveries: Delivery[] = [
  { 
    id: 'd1', 
    saleId: 's1', 
    type: 'Customer',
    origin: 'Shop Main',
    destination: '123 Main St, Springfield', 
    status: 'Pending', 
    driverId: 'u4',
    items: [{ productId: 'p1', name: 'Power Drill 18V', quantity: 1, price: 129.99, cost: 75.00 }],
    timeline: [
      { status: 'Order Processed', time: '2024-05-01 09:00 AM', note: 'Ready for dispatch' }
    ]
  },
];

export const initialIncoming: IncomingDelivery[] = [
  {
    id: 'INC-7721',
    supplier: 'Apex Tools Ltd',
    date: '2024-05-20',
    status: 'Expected',
    driverName: 'Tom Trucker',
    items: [
      { productId: 'p1', name: 'Power Drill 18V', expectedQty: 50 },
    ]
  },
];
