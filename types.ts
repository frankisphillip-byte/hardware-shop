
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  WAREHOUSE_CLERK = 'WAREHOUSE_CLERK',
  DRIVER = 'DRIVER',
  HR = 'HR'
}

export type LogType = 'SCAN' | 'UPDATE' | 'CREATE' | 'DELETE' | 'LOGIN' | 'TRANSACTION' | 'INVENTORY_ADJ' | 'PAYROLL' | 'TRANSFER' | 'EMPLOYEE' | 'SYSTEM' | 'PROFILE' | 'BRANCH';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  type: LogType;
  target: string;
  details: string;
  severity: 'info' | 'warning' | 'success' | 'danger';
}

export interface StockHistoryEntry {
  id: string;
  timestamp: string;
  changeAmount: number;
  newStock: number;
  reason: 'Sale' | 'Receipt' | 'Adjustment' | 'Transfer' | 'Initial';
  referenceId?: string;
  userId: string;
  userName: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  salary: number;
  branchId: string; // Linked to Branch.id
  permissions: string[]; // List of feature IDs: 'dashboard', 'pos', 'inventory', 'accounting', 'employees', 'deliveries'
}

export interface Branch {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface SystemConfig {
  storeName: string;
  currency: string;
  lowStockThreshold: number;
  taxRate: number;
  aiEnabled: boolean;
  paymentMethods: string[];
}

export type StockLocation = 'Shop' | 'Warehouse';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  sku: string;
  barcode: string;
  boxQuantity: number;
  location: StockLocation;
  branchId?: string; // Branch association for inventory scaling
  history: StockHistoryEntry[];
}

export interface PaySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: 'Paid' | 'Pending';
  generatedAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  cashierId: string;
  paymentMethod: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Utility' | 'Salary' | 'Maintenance' | 'Rent' | 'Fuel' | 'Telephone' | 'Meals' | 'Stock Purchase' | 'Other';
}

export interface TimelineEntry {
  status: string;
  time: string;
  note?: string;
}

export interface Delivery {
  id: string;
  saleId?: string;
  type: 'Customer' | 'Transfer';
  origin: string;
  destination: string;
  items: SaleItem[];
  status: 'Pending' | 'Picked Up' | 'Out for Delivery' | 'Delivered';
  driverId: string;
  timeline: TimelineEntry[];
}

export interface IncomingItem {
  productId: string;
  name: string;
  expectedQty: number;
  brokenQty?: number;
}

export interface IncomingDelivery {
  id: string;
  supplier: string;
  date: string;
  status: 'Expected' | 'Received' | 'Partially Broken';
  items: IncomingItem[];
  driverName: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}
