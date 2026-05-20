export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  qty: number;
  minQty: number; // For low stock alerts
  purchasePrice: number;
  salesPrice: number;
  location: string;
  updatedAt: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  items: InvoiceItem[];
  date: string;
  deadline: string;
  status: 'Draft' | 'Pending' | 'Paid' | 'Shipped';
  totalAmount: number;
  taxRate: number;
  notes?: string;
}

export interface WorkStep {
  id: string;
  name: string;
  status: 'Pending' | 'In_Progress' | 'Completed';
  completedAt?: string;
  completedBy?: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  productName: string;
  qty: number;
  targetDate: string;
  priority: 'Low' | 'Medium' | 'High';
  steps: WorkStep[];
  status: 'Draft' | 'Scheduled' | 'In_Progress' | 'Completed' | 'On_Hold';
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: 'Operations' | 'Sales' | 'HR' | 'Finance' | 'Engineering' | 'Quality_Control';
  salary: number;
  joinDate: string;
  status: 'Active' | 'On_Leave' | 'Inactive';
  paymentHistory: { month: string; amount: number; paidAt: string }[];
}

export interface ERPConfig {
  companyName: string;
  taxNumber: string;
  currency: 'USD' | 'EUR' | 'TRY' | 'GBP';
  taxRate: number;
}
