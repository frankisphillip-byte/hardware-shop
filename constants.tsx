
import React from 'react';

export const CATEGORIES = ['Tools', 'Lumber', 'Electrical', 'Plumbing', 'Paint', 'Hardware'];
export const EXPENSE_CATEGORIES = ['Utility', 'Salary', 'Maintenance', 'Rent', 'Fuel', 'Telephone', 'Meals', 'Other'];

export const ROLES_PERMISSIONS = {
  ADMIN: ['dashboard', 'pos', 'inventory', 'accounting', 'employees', 'deliveries'],
  CASHIER: ['pos', 'deliveries'],
  WAREHOUSE_CLERK: ['inventory', 'deliveries'],
  DRIVER: ['deliveries'],
  HR: ['dashboard', 'employees']
};
